<?php

namespace App\Http\Controllers;

use App\Jobs\CompressJob;
use App\Models\ImgBenchmark;
use App\Models\ImgBenchmarkRun;
use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Services\BenchmarkService;
use App\Services\MLAuditLogger;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use RuntimeException;

class BenchmarkController extends Controller
{
    public function index(Request $request, BenchmarkService $benchmarkService)
    {
        $benchmarks = ImgBenchmark::query()
            ->with(['runs.modelVersion.model'])
            ->where('author_id', Auth::id())
            ->latest()
            ->paginate(12);

        $benchmarks->getCollection()->transform(
            fn (ImgBenchmark $benchmark) => $benchmarkService->refresh($benchmark, true, false),
        );

        if ($request->expectsJson() || $request->has('page')) {
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
            'model_version_ids' => 'required|array|min:2|max:10',
            'model_version_ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('model_versions', 'id')->where('status', 'ready'),
            ],
            'images' => 'required|array|min:1|max:30',
            'images.*' => 'required|image|max:10240',
        ]);

        $modelVersions = ModelVersion::query()
            ->with('model')
            ->whereIn('id', $validated['model_version_ids'])
            ->get()
            ->keyBy('id');
        $benchmarkId = null;

        try {
            $benchmark = DB::transaction(function () use (
                $validated,
                $modelVersions,
                $request,
                $auditLogger,
                &$benchmarkId,
            ) {
                $firstModelVersionId = (int) $validated['model_version_ids'][0];
                $benchmark = ImgBenchmark::create([
                    'author_id' => Auth::id(),
                    'model_version_id' => $firstModelVersionId,
                    'name' => $validated['name'] ?: 'Benchmark '.now()->format('Y-m-d H:i'),
                    'status' => 'queue',
                    'summary' => null,
                    'errors' => null,
                ]);
                $benchmarkId = $benchmark->id;
                $sources = collect($request->file('images'))
                    ->map(fn (UploadedFile $file) => $this->storeSourceImage($benchmark, $file));

                $runs = collect($validated['model_version_ids'])
                    ->values()
                    ->map(function (int $modelVersionId, int $index) use (
                        $benchmark,
                        $modelVersions,
                        $sources,
                    ): ImgBenchmarkRun {
                        $modelVersion = $modelVersions->get($modelVersionId);
                        if ($modelVersion === null) {
                            throw new RuntimeException("Model version {$modelVersionId} is not available.");
                        }

                        $run = ImgBenchmarkRun::create([
                            'img_benchmark_id' => $benchmark->id,
                            'model_version_id' => $modelVersion->id,
                            'position' => $index + 1,
                            'status' => $index === 0 ? 'queue' : 'pending',
                            'started_at' => $index === 0 ? now() : null,
                        ]);

                        $sources->each(
                            fn (array $source) => $this->createRunImage($source, $modelVersion, $run),
                        );

                        return $run->load('images');
                    });

                $firstRun = $runs->first();
                CompressJob::dispatch(
                    (int) $firstRun->model_version_id,
                    $firstRun->images->pluck('id')->all(),
                )->afterCommit();

                $auditLogger->info('benchmark_created', [
                    'entity' => $benchmark,
                    'model_version_id' => $firstModelVersionId,
                    'message' => "Benchmark {$benchmark->name} queued.",
                    'context' => [
                        'model_version_ids' => $validated['model_version_ids'],
                        'models_count' => $runs->count(),
                        'images_count' => $sources->count(),
                    ],
                ]);

                return $benchmark;
            });
        } catch (\Throwable $exception) {
            if ($benchmarkId !== null) {
                Storage::deleteDirectory("benchmarks/{$benchmarkId}");
            }

            throw $exception;
        }

        return Redirect::route('benchmarks.show', $benchmark)
            ->with('message', 'Benchmark queued successfully.');
    }

    public function show(ImgBenchmark $benchmark, BenchmarkService $benchmarkService)
    {
        $this->authorizeBenchmark($benchmark);
        $benchmark = $benchmarkService->refresh($benchmark);

        $benchmark->runs->each(function (ImgBenchmarkRun $run) use ($benchmarkService): void {
            $run->images->each(function (ImgMedia $image) use ($benchmarkService): void {
                $image->setAttribute('benchmark_methods', $benchmarkService->imageMethods($image));
            });
        });

        return Inertia::render('Benchmarks/Show', compact('benchmark'));
    }

    public function export(ImgBenchmark $benchmark, BenchmarkService $benchmarkService)
    {
        $this->authorizeBenchmark($benchmark);
        $benchmark = $benchmarkService->refresh($benchmark, false);
        $filename = $this->safeBaseName($benchmark->name).'-results.csv';

        return response()->streamDownload(function () use ($benchmark, $benchmarkService): void {
            $stream = fopen('php://output', 'wb');
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, [
                'row_type',
                'benchmark',
                'model',
                'version',
                'resolution',
                'image',
                'status',
                'method',
                'original_size_bytes',
                'result_size_bytes',
                'saved_percent',
                'psnr',
                'ssim',
                'mse',
                'quality',
                'error',
            ]);

            foreach ($benchmark->runs as $run) {
                $modelName = $run->modelVersion?->model?->name ?? 'Deleted model';
                $version = $run->modelVersion?->version_number;
                $resolution = $run->modelVersion?->image_resolution;

                foreach (['ml', 'jpeg', 'webp'] as $method) {
                    $summary = $run->summary['methods'][$method] ?? [];
                    fputcsv($stream, [
                        'summary',
                        $benchmark->name,
                        $modelName,
                        $version,
                        $resolution,
                        '',
                        $run->status,
                        $method,
                        '',
                        $summary['avg_size'] ?? null,
                        $summary['avg_saved_percent'] ?? null,
                        $summary['avg_psnr'] ?? null,
                        $summary['avg_ssim'] ?? null,
                        $summary['avg_mse'] ?? null,
                        '',
                        $run->errors,
                    ]);
                }

                foreach ($run->images as $image) {
                    foreach ($benchmarkService->imageMethods($image) as $method => $metrics) {
                        if ($metrics === null && $method !== 'ml') {
                            continue;
                        }

                        fputcsv($stream, [
                            'image',
                            $benchmark->name,
                            $modelName,
                            $version,
                            $resolution,
                            $image->original_name,
                            $image->status,
                            $method,
                            $image->original_size,
                            $metrics['size'] ?? null,
                            $metrics['saved_percent'] ?? null,
                            $metrics['psnr'] ?? null,
                            $metrics['ssim'] ?? null,
                            $metrics['mse'] ?? null,
                            $metrics['quality'] ?? null,
                            $image->errors,
                        ]);
                    }
                }
            }

            fclose($stream);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function destroy(ImgBenchmark $benchmark, MLAuditLogger $auditLogger)
    {
        $this->authorizeBenchmark($benchmark);
        $benchmark->load(['runs.images', 'images', 'modelVersion']);
        $images = $benchmark->runs
            ->flatMap(fn (ImgBenchmarkRun $run) => $run->images)
            ->concat($benchmark->images)
            ->unique('id');

        foreach ($images as $image) {
            $this->deleteImageFiles($image);
            $image->delete();
        }

        Storage::deleteDirectory("benchmarks/{$benchmark->id}");

        $auditLogger->info('benchmark_deleted', [
            'entity' => $benchmark,
            'model_version' => $benchmark->modelVersion,
            'message' => "Benchmark {$benchmark->name} deleted.",
        ]);

        $benchmark->delete();

        return Redirect::route('benchmarks.index')->with('message', 'Benchmark deleted successfully.');
    }

    private function storeSourceImage(ImgBenchmark $benchmark, UploadedFile $file): array
    {
        $path = Storage::putFile("benchmarks/{$benchmark->id}/sources", $file);
        if (! is_string($path)) {
            throw new RuntimeException("Could not store {$file->getClientOriginalName()}.");
        }

        return [
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'original_size' => $file->getSize() ?? 0,
        ];
    }

    private function createRunImage(
        array $source,
        ModelVersion $modelVersion,
        ImgBenchmarkRun $run,
    ): ImgMedia {
        $image = ImgMedia::create([
            'original_name' => $source['original_name'],
            'mime_type' => $source['mime_type'],
            'original_size' => $source['original_size'],
            'author_id' => Auth::id(),
            'model_version_id' => $modelVersion->id,
            'entity_id' => $run->id,
            'entity_type' => ImgBenchmarkRun::class,
            'status' => 'just created',
            'errors' => '',
        ]);
        $extension = pathinfo($source['path'], PATHINFO_EXTENSION);
        $destination = "img-media/{$image->id}/original".($extension !== '' ? ".{$extension}" : '');

        if (! Storage::copy($source['path'], $destination)) {
            throw new RuntimeException("Could not prepare {$source['original_name']} for benchmark.");
        }

        $image->update(['img_path' => $destination]);

        return $image->fresh();
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

    private function safeBaseName(string $filename): string
    {
        return preg_replace('/[^A-Za-z0-9._-]+/', '_', $filename) ?: 'benchmark';
    }
}
