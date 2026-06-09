<?php

namespace App\Services;

use App\Jobs\CompressJob;
use App\Models\ImgBenchmark;
use App\Models\ImgBenchmarkRun;
use App\Models\ImgMedia;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class BenchmarkService
{
    private const TERMINAL_STATUSES = ['ready', 'error', 'cancel'];

    public function refresh(
        ImgBenchmark $benchmark,
        bool $advance = true,
        bool $withImages = true,
    ): ImgBenchmark {
        $runIds = $benchmark->runs()->pluck('id');

        foreach ($runIds as $runId) {
            $this->refreshRun((int) $runId, false);
        }

        $this->refreshBenchmark($benchmark->id, $advance);

        $relations = ['runs.modelVersion.model'];

        if ($withImages) {
            $relations['runs.images'] = fn ($query) => $query->orderBy('id');
        }

        return $benchmark->fresh($relations);
    }

    public function refreshForImage(ImgMedia $image): void
    {
        if ($image->entity_type !== ImgBenchmarkRun::class || $image->entity_id === null) {
            return;
        }

        $this->refreshRun((int) $image->entity_id);
    }

    public function refreshRun(int $runId, bool $advance = true): void
    {
        $benchmarkId = DB::transaction(function () use ($runId): ?int {
            $run = ImgBenchmarkRun::query()
                ->lockForUpdate()
                ->find($runId);

            if ($run === null) {
                return null;
            }

            $images = $run->images()->get();
            $status = $this->runStatus($run, $images);
            $terminal = in_array($status, self::TERMINAL_STATUSES, true);
            $errors = $images
                ->where('status', 'error')
                ->pluck('errors')
                ->filter()
                ->take(3)
                ->implode(' ');

            $run->update([
                'status' => $status,
                'summary' => $this->runSummary($images),
                'errors' => $errors !== '' ? $errors : null,
                'started_at' => $run->started_at
                    ?? (in_array($status, ['queue', 'run'], true) ? now() : null),
                'finished_at' => $terminal ? ($run->finished_at ?? now()) : null,
            ]);

            return $run->img_benchmark_id;
        });

        if ($benchmarkId !== null) {
            $this->refreshBenchmark($benchmarkId, $advance);
        }
    }

    public function imageMethods(ImgMedia $image): array
    {
        return [
            'ml' => $this->methodMetrics($image, 'ml'),
            'jpeg' => $this->methodMetrics($image, 'jpeg'),
            'webp' => $this->methodMetrics($image, 'webp'),
        ];
    }

    private function refreshBenchmark(int $benchmarkId, bool $advance): void
    {
        DB::transaction(function () use ($benchmarkId, $advance): void {
            $benchmark = ImgBenchmark::query()
                ->lockForUpdate()
                ->find($benchmarkId);

            if ($benchmark === null) {
                return;
            }

            $runs = $benchmark->runs()
                ->with(['modelVersion.model', 'images'])
                ->get();

            if ($runs->isEmpty()) {
                return;
            }

            if ($advance && ! $runs->contains(fn (ImgBenchmarkRun $run) => in_array($run->status, ['queue', 'run'], true))) {
                $nextRun = $runs->firstWhere('status', 'pending');

                if ($nextRun !== null) {
                    $nextRun->update([
                        'status' => 'queue',
                        'started_at' => now(),
                        'finished_at' => null,
                        'errors' => null,
                    ]);

                    CompressJob::dispatch(
                        (int) $nextRun->model_version_id,
                        $nextRun->images->pluck('id')->all(),
                    )->afterCommit();

                    $runs = $benchmark->runs()
                        ->with(['modelVersion.model', 'images'])
                        ->get();
                }
            }

            $activeRuns = $runs->whereIn('status', ['queue', 'run']);
            $pendingRuns = $runs->where('status', 'pending');
            $terminalRuns = $runs->whereIn('status', self::TERMINAL_STATUSES);

            $status = match (true) {
                $activeRuns->isNotEmpty() => $terminalRuns->isEmpty() ? 'queue' : 'run',
                $pendingRuns->isNotEmpty() => 'queue',
                $runs->contains('status', 'error') => 'error',
                $runs->every(fn (ImgBenchmarkRun $run) => $run->status === 'cancel') => 'cancel',
                default => 'ready',
            };

            $summary = [
                'models_count' => $runs->count(),
                'completed_models_count' => $terminalRuns->count(),
                'images_count' => (int) ($runs->first()?->images->count() ?? 0),
                'comparisons_count' => $runs->sum(fn (ImgBenchmarkRun $run) => $run->images->count()),
                'runs' => $runs->map(fn (ImgBenchmarkRun $run) => [
                    'id' => $run->id,
                    'position' => $run->position,
                    'status' => $run->status,
                    'model_version_id' => $run->model_version_id,
                    'model_name' => $run->modelVersion?->model?->name,
                    'version_number' => $run->modelVersion?->version_number,
                    'image_resolution' => $run->modelVersion?->image_resolution,
                    'summary' => $run->summary,
                    'errors' => $run->errors,
                ])->values()->all(),
                'updated_at' => now()->toISOString(),
            ];

            $benchmark->update([
                'status' => $status,
                'summary' => $summary,
                'errors' => $runs->pluck('errors')->filter()->take(3)->implode(' ') ?: null,
            ]);
        });
    }

    private function runStatus(ImgBenchmarkRun $run, Collection $images): string
    {
        if ($images->isEmpty() || $run->status === 'pending') {
            return $run->status;
        }

        $active = $images->whereIn('status', ['just created', 'compressing']);
        $completedCount = $images->where('status', 'compressed')->count();

        if ($active->isNotEmpty()) {
            return $images->contains('status', 'compressing') || $completedCount > 0
                ? 'run'
                : 'queue';
        }

        if ($images->contains('status', 'error')) {
            return 'error';
        }

        if ($images->contains('status', 'cancel')) {
            return 'cancel';
        }

        return $completedCount === $images->count() ? 'ready' : $run->status;
    }

    private function runSummary(Collection $images): array
    {
        $completed = $images->where('status', 'compressed');

        return [
            'images_count' => $images->count(),
            'completed_count' => $completed->count(),
            'active_count' => $images->whereIn('status', ['just created', 'compressing'])->count(),
            'error_count' => $images->where('status', 'error')->count(),
            'cancel_count' => $images->where('status', 'cancel')->count(),
            'methods' => [
                'ml' => $this->methodSummary($completed, 'ml'),
                'jpeg' => $this->methodSummary($completed, 'jpeg'),
                'webp' => $this->methodSummary($completed, 'webp'),
            ],
            'best_cases' => $this->rankedCases($completed, true),
            'worst_cases' => $this->rankedCases($completed, false),
            'updated_at' => now()->toISOString(),
        ];
    }

    private function methodSummary(Collection $images, string $method): array
    {
        $rows = $images
            ->map(fn (ImgMedia $image) => $this->methodMetrics($image, $method))
            ->filter()
            ->values();

        return [
            'count' => $rows->count(),
            'avg_size' => $this->avg($rows->pluck('size')),
            'avg_saved_percent' => $this->avg($rows->pluck('saved_percent')),
            'avg_psnr' => $this->avg($rows->pluck('psnr')),
            'avg_ssim' => $this->avg($rows->pluck('ssim')),
            'avg_mse' => $this->avg($rows->pluck('mse')),
        ];
    }

    private function methodMetrics(ImgMedia $image, string $method): ?array
    {
        $metrics = $image->quality_metrics ?? [];

        if ($method === 'ml') {
            if ($image->compressed_size === null) {
                return null;
            }

            return [
                'size' => $image->compressed_size,
                'saved_percent' => $this->savedPercent($image->compressed_size, $image->original_size),
                'psnr' => $metrics['psnr'] ?? null,
                'ssim' => $metrics['ssim'] ?? null,
                'mse' => $metrics['mse'] ?? null,
                'quality' => null,
            ];
        }

        $baseline = $metrics['baselines'][$method] ?? null;
        if (! is_array($baseline) || ! isset($baseline['size'])) {
            return null;
        }

        return [
            'size' => $baseline['size'],
            'saved_percent' => $this->savedPercent((int) $baseline['size'], $image->original_size),
            'psnr' => $baseline['psnr'] ?? null,
            'ssim' => $baseline['ssim'] ?? null,
            'mse' => $baseline['mse'] ?? null,
            'quality' => $baseline['quality'] ?? null,
        ];
    }

    private function rankedCases(Collection $images, bool $descending): array
    {
        return $images
            ->map(function (ImgMedia $image): ?array {
                $metrics = $image->quality_metrics ?? [];
                if (! is_numeric($metrics['psnr'] ?? null)) {
                    return null;
                }

                return [
                    'id' => $image->id,
                    'original_name' => $image->original_name,
                    'original_size' => $image->original_size,
                    'compressed_size' => $image->compressed_size,
                    'saved_percent' => $this->savedPercent($image->compressed_size, $image->original_size),
                    'psnr' => $metrics['psnr'],
                    'ssim' => $metrics['ssim'] ?? null,
                    'mse' => $metrics['mse'] ?? null,
                ];
            })
            ->filter()
            ->sortBy('psnr', SORT_REGULAR, $descending)
            ->take(3)
            ->values()
            ->all();
    }

    private function avg(Collection $values): ?float
    {
        $numbers = $values->filter(fn ($value) => is_numeric($value));

        return $numbers->isEmpty() ? null : round((float) $numbers->avg(), 6);
    }

    private function savedPercent(?int $size, ?int $originalSize): ?float
    {
        if (! $size || ! $originalSize) {
            return null;
        }

        return round(100 - ($size / $originalSize * 100), 4);
    }
}
