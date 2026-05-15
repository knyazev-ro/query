<?php

namespace App\Services;

use App\Models\ImgMedia;
use App\Models\ModelVersion;
use GuzzleHttp\Client;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class MLConnector
{
    protected Client $client;
    protected string $url;

    public function __construct()
    {
        $this->url = rtrim((string) config('services.img_compress_ml.url'), '/');
        $this->client = new Client([
            'timeout' => config('services.img_compress_ml.timeout', 60),
            'base_uri' => $this->url,
        ]);
    }

    public function train(ModelVersion $modelVersion)
    {
        try {
            $startedAt = now();
            $modelVersion->loadMissing(['datasets', 'model']);

            $modelVersion->update([
                'status' => 'run',
                'errors' => null,
                'training_started_at' => $startedAt,
                'training_finished_at' => null,
                'training_report' => $this->initialTrainingReport($modelVersion, $startedAt),
            ]);

            return $this->postJson('/train', [
                'model_version' => $this->modelVersionPayload($modelVersion),
                'callback_url' => $this->callbackUrl('callbacks.train'),
            ]);
        } catch (Throwable $exception) {
            $modelVersion->update([
                'status' => 'error',
                'errors' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    public function healthcheck(): array
    {
        return $this->getJson('/healthcheck');
    }

    /**
     * [Description for compress]\
     * FIRE AND FORGET METHOD - USED IN JOBS!
     *
     * @param ModelVersion $modelVersion
     * @param Collection $imgMedia
     * 
     * @return [type]
     * 
     */
    public function compress(ModelVersion $modelVersion, Collection $imgMedia)
    {
        try {
            $imgMedia->each->update([
                'status' => 'compressing',
                'errors' => '',
            ]);

            return $this->postJson('/compress', [
                'model_version' => $this->modelVersionPayload($modelVersion),
                'images' => $this->imagesPayload($imgMedia, 'img_path'),
                'callback_url' => $this->callbackUrl('callbacks.compression'),
            ]);
        } catch (Throwable $exception) {
            $imgMedia->each->update([
                'status' => 'error',
                'errors' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }

    /**
     * [Description for decompress]
     * WAIT UNTILL GET! (NOT FIRE AND FORGET)
     *
     * @param ModelVersion $modelVersion
     * 
     * @return [type]
     * 
     */
    public function decompress(ModelVersion $modelVersion, Collection $imgMedia)
    {
        return $this->postJson('/decompress', [
            'model_version' => $this->modelVersionPayload($modelVersion),
            'images' => $this->imagesPayload($imgMedia, 'compressed_img_path', includeOriginal: true),
        ]);
    }

    public function cancelTrain(ModelVersion $modelVersion): array
    {
        $response = $this->postJson('/train/cancel', [
            'model_version_id' => $modelVersion->id,
        ]);

        $modelVersion->update([
            'status' => 'cancel',
            'errors' => null,
        ]);

        return $response;
    }

    public function cancelCompression(ModelVersion $modelVersion, Collection $imgMedia): array
    {
        $response = $this->postJson('/compress/cancel', [
            'model_version_id' => $modelVersion->id,
            'image_ids' => $imgMedia->pluck('id')->values()->all(),
        ]);

        $imgMedia->each->update([
            'status' => 'cancel',
            'errors' => '',
        ]);

        return $response;
    }

    private function postJson(string $uri, array $payload): array
    {
        $response = $this->client->post($uri, [
            'json' => $payload,
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);

        $body = (string) $response->getBody();

        if ($body === '') {
            return [
                'status_code' => $response->getStatusCode(),
            ];
        }

        return json_decode($body, true, flags: JSON_THROW_ON_ERROR);
    }

    private function getJson(string $uri): array
    {
        $response = $this->client->get($uri, [
            'headers' => [
                'Accept' => 'application/json',
            ],
        ]);

        $body = (string) $response->getBody();

        if ($body === '') {
            return [
                'status_code' => $response->getStatusCode(),
            ];
        }

        return json_decode($body, true, flags: JSON_THROW_ON_ERROR);
    }

    private function callbackUrl(string $routeName): string
    {
        $baseUrl = trim((string) config('services.img_compress_ml.callback_base_url', ''));

        if ($baseUrl === '') {
            return route($routeName, absolute: true);
        }

        return rtrim($baseUrl, '/').'/'.ltrim(route($routeName, absolute: false), '/');
    }

    private function modelVersionPayload(ModelVersion $modelVersion): array
    {
        $modelVersion = $modelVersion->loadMissing(['datasets', 'author', 'model']);
        $payload = $modelVersion->toArray();

        $payload['datasets'] = $modelVersion->datasets
            ->map(fn ($dataset) => $dataset->toArray())
            ->values()
            ->all();

        return $payload;
    }

    private function initialTrainingReport(ModelVersion $modelVersion, $startedAt): array
    {
        return [
            'status' => 'run',
            'started_at' => $startedAt->toISOString(),
            'finished_at' => null,
            'duration_seconds' => null,
            'parameters' => [
                'image_resolution' => $modelVersion->image_resolution,
                'train_epochs' => config('services.img_compress_ml.train_epochs'),
                'train_batch_size' => config('services.img_compress_ml.train_batch_size'),
            ],
            'model' => [
                'id' => $modelVersion->img_compress_model_id,
                'name' => $modelVersion->model?->name,
                'version_number' => $modelVersion->version_number,
                'parent_version_id' => $modelVersion->parent_version_id,
            ],
            'datasets' => $modelVersion->datasets
                ->map(fn ($dataset) => [
                    'id' => $dataset->id,
                    'name' => $dataset->name,
                    'images_count' => $dataset->images_count,
                    'image_resolution' => $dataset->image_resolution,
                    'train_split' => $dataset->train_split,
                    'test_split' => $dataset->test_split,
                    'profile' => $dataset->profile,
                ])
                ->values()
                ->all(),
            'ml_service' => $this->safeHealthcheck(),
            'loss_history' => [],
            'latest_progress' => null,
            'quality_metrics' => null,
            'errors' => null,
        ];
    }

    private function safeHealthcheck(): ?array
    {
        try {
            return $this->healthcheck();
        } catch (Throwable) {
            return null;
        }
    }

    private function imagesPayload(Collection $imgMedia, string $pathAttribute, bool $includeOriginal = false): array
    {
        return $imgMedia
            ->map(function (ImgMedia $image) use ($pathAttribute, $includeOriginal) {
                $path = $image->{$pathAttribute} ?: $image->img_path;

                if ($path === null) {
                    throw new RuntimeException("Image {$image->id} does not have a path for {$pathAttribute}.");
                }

                $payload = [
                    ...$image->toArray(),
                    'file_base64' => $this->fileBase64($path),
                ];

                if ($includeOriginal && $image->img_path !== null && Storage::exists($image->img_path)) {
                    $payload['original_file_base64'] = $this->fileBase64($image->img_path);
                }

                return $payload;
            })
            ->values()
            ->all();
    }

    private function fileBase64(string $path): string
    {
        if (! Storage::exists($path)) {
            throw new RuntimeException("File {$path} does not exist in storage.");
        }

        return base64_encode(Storage::get($path));
    }
}
