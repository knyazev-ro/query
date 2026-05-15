<?php

namespace App\Http\Controllers;

use App\Jobs\CompressJob;
use App\Models\ImgBenchmark;
use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Services\MLAuditLogger;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BenchmarkController extends Controller
{
    public function index(Request $request)
    {
        $benchmarks = ImgBenchmark::query()
            ->with(['modelVersion.model'])
            ->withCount('images')
            ->where('author_id', Auth::id())
            ->latest()
            ->paginate(12);

        $benchmarks->getCollection()->each(function (ImgBenchmark $benchmark): void {
            $benchmark->load('images');
            $this->refreshSummary($benchmark);
            $benchmark->unsetRelation('images');
        });

        if ($request->has('page')) {
            return $benchmarks;
        }

        return Inertia::render('Benchmarks/Main', compact('benchmarks'));
    }

    public function create()
    {
        $modelVersions = ModelVersion::query()
            ->with('model')
            ->where('status', 'ready')
            ->latest()
            ->get();

        return Inertia::render('Benchmarks/Create', compact('modelVersions'));
    }

    public function store(Request $request, MLAuditLogger $auditLogger)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'model_version_id' => [
                'required',
                'integer',
                Rule::exists('model_versions', 'id')->where('status', 'ready'),
            ],
            'images' => 'required|array|min:1|max:30',
            'images.*' => 'required|image|max:10240',
        ]);

        $modelVersion = ModelVersion::findOrFail($validated['model_version_id']);
        $files = $request->file('images');

        $benchmark = DB::transaction(function () use ($validated, $modelVersion, $files, $auditLogger) {
            $benchmark = ImgBenchmark::create([
                'author_id' => Auth::id(),
                'model_version_id' => $modelVersion->id,
                'name' => $validated['name'] ?: 'Benchmark '.now()->format('Y-m-d H:i'),
                'status' => 'queue',
                'summary' => null,
                'errors' => null,
            ]);

            $images = collect($files)
                ->map(fn (UploadedFile $file) => $this->storeBenchmarkImage($file, $modelVersion, $benchmark))
                ->values();

            CompressJob::dispatch(
                $modelVersion->id,
                $images->pluck('id')->all(),
            )->afterCommit();

            $auditLogger->info('benchmark_created', [
                'entity' => $benchmark,
                'model_version' => $modelVersion,
                'message' => "Benchmark {$benchmark->name} queued.",
                'context' => [
                    'image_ids' => $images->pluck('id')->all(),
                    'images_count' => $images->count(),
                ],
            ]);

            return $benchmark;
        });

        return Redirect::route('benchmarks.show', $benchmark->id)
            ->with('message', 'Benchmark queued successfully.');
    }

    public function show(ImgBenchmark $benchmark)
    {
        $this->authorizeBenchmark($benchmark);
        $benchmark->load(['modelVersion.model', 'images' => fn ($query) => $query->latest()]);
        $this->refreshSummary($benchmark);

        return Inertia::render('Benchmarks/Show', compact('benchmark'));
    }

    public function destroy(ImgBenchmark $benchmark, MLAuditLogger $auditLogger)
    {
        $this->authorizeBenchmark($benchmark);
        $benchmark->load(['images', 'modelVersion']);

        foreach ($benchmark->images as $image) {
            $this->deleteImageFiles($image);
            $image->delete();
        }

        $auditLogger->info('benchmark_deleted', [
            'entity' => $benchmark,
            'model_version' => $benchmark->modelVersion,
            'message' => "Benchmark {$benchmark->name} deleted.",
        ]);

        $benchmark->delete();

        return Redirect::route('benchmarks.index')->with('message', 'Benchmark deleted successfully.');
    }

    private function storeBenchmarkImage(UploadedFile $file, ModelVersion $modelVersion, ImgBenchmark $benchmark): ImgMedia
    {
        $image = ImgMedia::create([
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'original_size' => $file->getSize() ?? 0,
            'author_id' => Auth::id(),
            'model_version_id' => $modelVersion->id,
            'entity_id' => $benchmark->id,
            'entity_type' => ImgBenchmark::class,
            'status' => 'just created',
            'errors' => '',
        ]);

        $image->update([
            'img_path' => Storage::putFile("img-media/{$image->id}", $file),
        ]);

        return $image->fresh();
    }

    private function refreshSummary(ImgBenchmark $benchmark): void
    {
        $benchmark->loadMissing('images');
        $images = $benchmark->images;

        if ($images->isEmpty()) {
            return;
        }

        $activeCount = $images->whereIn('status', ['just created', 'compressing'])->count();
        $completed = $images->where('status', 'compressed');
        $errorCount = $images->where('status', 'error')->count();
        $cancelCount = $images->where('status', 'cancel')->count();
        $status = match (true) {
            $activeCount > 0 => $completed->isEmpty() ? 'queue' : 'run',
            $completed->count() === $images->count() => 'ready',
            $errorCount > 0 => 'error',
            $cancelCount === $images->count() => 'cancel',
            default => 'ready',
        };

        $summary = [
            'images_count' => $images->count(),
            'completed_count' => $completed->count(),
            'active_count' => $activeCount,
            'error_count' => $errorCount,
            'cancel_count' => $cancelCount,
            'methods' => [
                'ml' => $this->methodSummary($completed, 'ml'),
                'jpeg' => $this->methodSummary($completed, 'jpeg'),
                'webp' => $this->methodSummary($completed, 'webp'),
            ],
            'best_cases' => $this->rankedCases($completed, descending: true),
            'worst_cases' => $this->rankedCases($completed, descending: false),
            'updated_at' => now()->toISOString(),
        ];

        if ($benchmark->status !== $status || $benchmark->summary !== $summary) {
            $benchmark->update([
                'status' => $status,
                'summary' => $summary,
                'errors' => $errorCount > 0
                    ? $images->where('status', 'error')->pluck('errors')->filter()->take(3)->implode(' ')
                    : null,
            ]);
        }
    }

    private function methodSummary($images, string $method): array
    {
        $rows = $images
            ->map(fn (ImgMedia $image) => $this->methodMetrics($image, $method))
            ->filter()
            ->values();

        return [
            'count' => $rows->count(),
            'avg_size' => $this->avg($rows->pluck('size')->all()),
            'avg_saved_percent' => $this->avg($rows->pluck('saved_percent')->all()),
            'avg_psnr' => $this->avg($rows->pluck('psnr')->all()),
            'avg_ssim' => $this->avg($rows->pluck('ssim')->all()),
            'avg_mse' => $this->avg($rows->pluck('mse')->all()),
        ];
    }

    private function methodMetrics(ImgMedia $image, string $method): ?array
    {
        $metrics = $image->quality_metrics ?? [];

        if ($method === 'ml') {
            $size = $image->compressed_size;
            if ($size === null) {
                return null;
            }

            return [
                'size' => $size,
                'saved_percent' => $this->savedPercent($size, $image->original_size),
                'psnr' => $metrics['psnr'] ?? null,
                'ssim' => $metrics['ssim'] ?? null,
                'mse' => $metrics['mse'] ?? null,
            ];
        }

        $baseline = $metrics['baselines'][$method] ?? null;
        if (! is_array($baseline)) {
            return null;
        }

        return [
            'size' => $baseline['size'] ?? null,
            'saved_percent' => $this->savedPercent($baseline['size'] ?? null, $image->original_size),
            'psnr' => $baseline['psnr'] ?? null,
            'ssim' => $baseline['ssim'] ?? null,
            'mse' => $baseline['mse'] ?? null,
            'quality' => $baseline['quality'] ?? null,
        ];
    }

    private function rankedCases($images, bool $descending): array
    {
        return $images
            ->map(function (ImgMedia $image) {
                $metrics = $image->quality_metrics ?? [];
                $psnr = $metrics['psnr'] ?? null;

                if (! is_numeric($psnr)) {
                    return null;
                }

                return [
                    'id' => $image->id,
                    'original_name' => $image->original_name,
                    'original_size' => $image->original_size,
                    'compressed_size' => $image->compressed_size,
                    'saved_percent' => $this->savedPercent($image->compressed_size, $image->original_size),
                    'psnr' => $psnr,
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

    private function avg(array $values): ?float
    {
        $numbers = collect($values)
            ->filter(fn ($value) => is_numeric($value))
            ->values();

        if ($numbers->isEmpty()) {
            return null;
        }

        return round((float) $numbers->avg(), 6);
    }

    private function savedPercent(?int $size, ?int $originalSize): ?float
    {
        if (! $size || ! $originalSize) {
            return null;
        }

        return round(max(100 - ($size / $originalSize * 100), 0), 4);
    }

    private function deleteImageFiles(ImgMedia $imgMedia): void
    {
        if ($imgMedia->img_path !== null) {
            Storage::delete($imgMedia->img_path);
        }

        if ($imgMedia->compressed_img_path !== null) {
            Storage::delete($imgMedia->compressed_img_path);
        }

        Storage::deleteDirectory("ml/analysis/img-media-{$imgMedia->id}");
    }

    private function authorizeBenchmark(ImgBenchmark $benchmark): void
    {
        abort_if($benchmark->author_id !== Auth::id(), 404);
    }
}
