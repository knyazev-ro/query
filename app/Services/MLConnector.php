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
            $modelVersion->update([
                'status' => 'run',
                'errors' => null,
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
            'images' => $this->imagesPayload($imgMedia, 'compressed_img_path'),
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

    private function imagesPayload(Collection $imgMedia, string $pathAttribute): array
    {
        return $imgMedia
            ->map(function (ImgMedia $image) use ($pathAttribute) {
                $path = $image->{$pathAttribute} ?: $image->img_path;

                if ($path === null) {
                    throw new RuntimeException("Image {$image->id} does not have a path for {$pathAttribute}.");
                }

                return [
                    ...$image->toArray(),
                    'file_base64' => $this->fileBase64($path),
                ];
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
