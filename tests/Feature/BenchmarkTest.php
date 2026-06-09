<?php

namespace Tests\Feature;

use App\Jobs\CompressJob;
use App\Models\ImgBenchmark;
use App\Models\ImgBenchmarkRun;
use App\Models\ImgCompressModel;
use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Models\User;
use App\Services\BenchmarkService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BenchmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_benchmark_for_multiple_models(): void
    {
        Storage::fake('local');
        Queue::fake();
        $user = User::factory()->create();
        [$firstVersion, $secondVersion] = $this->readyVersions($user);

        $response = $this->actingAs($user)->post(route('benchmarks.store'), [
            'name' => 'Codec comparison',
            'model_version_ids' => [$firstVersion->id, $secondVersion->id],
            'images' => [
                UploadedFile::fake()->image('one.jpg', 80, 80),
                UploadedFile::fake()->image('two.png', 64, 64),
            ],
        ]);

        $benchmark = ImgBenchmark::query()->firstOrFail();
        $runs = $benchmark->runs()->with('images')->get();

        $response->assertRedirect(route('benchmarks.show', $benchmark));
        $this->assertSame(['queue', 'pending'], $runs->pluck('status')->all());
        $this->assertSame(
            [2, 2],
            $runs->map(fn (ImgBenchmarkRun $run) => $run->images->count())->all(),
        );
        $this->assertSame(
            [$firstVersion->id, $secondVersion->id],
            $runs->pluck('model_version_id')->all(),
        );

        $runs->flatMap(fn (ImgBenchmarkRun $run) => $run->images)->each(
            fn (ImgMedia $image) => Storage::assertExists($image->img_path),
        );
        Queue::assertPushed(CompressJob::class, fn (CompressJob $job) => (
            $job->modelVersionId === $firstVersion->id
            && count($job->imgMediaIds) === 2
        ));
    }

    public function test_next_model_is_queued_only_after_previous_run_finishes(): void
    {
        Queue::fake();
        $user = User::factory()->create();
        [$firstVersion, $secondVersion] = $this->readyVersions($user);
        $benchmark = ImgBenchmark::create([
            'author_id' => $user->id,
            'model_version_id' => $firstVersion->id,
            'name' => 'Sequential benchmark',
            'status' => 'run',
        ]);
        $firstRun = $this->createRun($benchmark, $firstVersion, 1, 'run');
        $secondRun = $this->createRun($benchmark, $secondVersion, 2, 'pending');
        $firstImage = $this->image($user, $firstVersion, $firstRun, 'compressed');
        $secondImage = $this->image($user, $secondVersion, $secondRun, 'just created');

        app(BenchmarkService::class)->refreshRun($firstRun->id);

        $this->assertSame('ready', $firstRun->fresh()->status);
        $this->assertSame('queue', $secondRun->fresh()->status);
        $this->assertSame('run', $benchmark->fresh()->status);
        Queue::assertPushed(CompressJob::class, fn (CompressJob $job) => (
            $job->modelVersionId === $secondVersion->id
            && $job->imgMediaIds === [$secondImage->id]
        ));
        $this->assertSame('compressed', $firstImage->fresh()->status);
    }

    public function test_csv_export_contains_model_summaries_and_image_rows(): void
    {
        Queue::fake();
        $user = User::factory()->create();
        [$firstVersion, $secondVersion] = $this->readyVersions($user);
        $benchmark = ImgBenchmark::create([
            'author_id' => $user->id,
            'model_version_id' => $firstVersion->id,
            'name' => 'Export benchmark',
            'status' => 'ready',
        ]);

        foreach ([[$firstVersion, 1], [$secondVersion, 2]] as [$version, $position]) {
            $run = $this->createRun($benchmark, $version, $position, 'ready');
            $this->image($user, $version, $run, 'compressed');
        }

        app(BenchmarkService::class)->refresh($benchmark, false);
        $response = $this->actingAs($user)->get(route('benchmarks.export', $benchmark));
        $content = $response->streamedContent();

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('row_type,benchmark,model,version', $content);
        $this->assertStringContainsString('summary,"Export benchmark","Model A"', $content);
        $this->assertStringContainsString('image,"Export benchmark","Model B"', $content);
        $this->assertStringContainsString(',jpeg,', $content);
        $this->assertStringContainsString(',webp,', $content);
    }

    private function readyVersions(User $user): array
    {
        return collect(['Model A', 'Model B'])
            ->map(function (string $name) use ($user): ModelVersion {
                $model = ImgCompressModel::create([
                    'author_id' => $user->id,
                    'name' => $name,
                ]);

                return ModelVersion::create([
                    'img_compress_model_id' => $model->id,
                    'version_number' => 1,
                    'image_resolution' => 64,
                    'status' => 'ready',
                    'author_id' => $user->id,
                ]);
            })
            ->all();
    }

    private function createRun(
        ImgBenchmark $benchmark,
        ModelVersion $version,
        int $position,
        string $status,
    ): ImgBenchmarkRun {
        return ImgBenchmarkRun::create([
            'img_benchmark_id' => $benchmark->id,
            'model_version_id' => $version->id,
            'position' => $position,
            'status' => $status,
        ]);
    }

    private function image(
        User $user,
        ModelVersion $version,
        ImgBenchmarkRun $run,
        string $status,
    ): ImgMedia {
        return ImgMedia::create([
            'img_path' => "tests/{$run->id}.jpg",
            'original_name' => 'sample.jpg',
            'mime_type' => 'image/jpeg',
            'original_size' => 1000,
            'compressed_size' => $status === 'compressed' ? 400 : null,
            'author_id' => $user->id,
            'model_version_id' => $version->id,
            'entity_id' => $run->id,
            'entity_type' => ImgBenchmarkRun::class,
            'status' => $status,
            'errors' => '',
            'quality_metrics' => $status === 'compressed' ? [
                'psnr' => 31.5,
                'ssim' => 0.94,
                'mse' => 0.001,
                'baselines' => [
                    'jpeg' => [
                        'size' => 420,
                        'quality' => 80,
                        'psnr' => 30.1,
                        'ssim' => 0.92,
                        'mse' => 0.0012,
                    ],
                    'webp' => [
                        'size' => 390,
                        'quality' => 75,
                        'psnr' => 32.2,
                        'ssim' => 0.95,
                        'mse' => 0.0009,
                    ],
                ],
            ] : null,
        ]);
    }
}
