<?php

namespace App\Http\Controllers;

use App\Jobs\CompressJob;
use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Services\ImageAnalysisService;
use App\Services\MLAuditLogger;
use App\Services\MLConnector;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CompressionController extends Controller
{
    public function index(Request $request)
    {
        $images = ImgMedia::query()
            ->with(['author', 'modelVersion.model'])
            ->where('author_id', Auth::id())
            ->latest()
            ->paginate(20);

        if ($request->has('page')) {
            return $images;
        }

        return Inertia::render('Compressions/Main', compact('images'));
    }

    public function create()
    {
        $modelVersions = ModelVersion::query()
            ->with('model')
            ->where('status', 'ready')
            ->latest()
            ->get();

        return Inertia::render('Compressions/Create', compact('modelVersions'));
    }

    public function show(ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        $imgMedia->load(['author', 'modelVersion.model']);
        $this->ensureBaselineComparison($imgMedia);

        return Inertia::render('Compressions/Show', compact('imgMedia'));
    }

    public function original(ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        abort_if($imgMedia->img_path === null || ! Storage::exists($imgMedia->img_path), 404);

        return Storage::response($imgMedia->img_path, $imgMedia->original_name);
    }

    public function compressed(ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        abort_if($imgMedia->compressed_img_path === null || ! Storage::exists($imgMedia->compressed_img_path), 404);

        $baseName = $this->safeBaseName($imgMedia->original_name);

        return Storage::response(
            $imgMedia->compressed_img_path,
            "{$baseName}-compressed.npz",
            ['Content-Type' => 'application/octet-stream'],
        );
    }

    public function decompressed(Request $request, ImgMedia $imgMedia, MLConnector $mlConnector)
    {
        $this->authorizeImage($imgMedia);

        $image = $this->decompressedImage($imgMedia, $mlConnector);
        $bytes = $image['bytes'];

        $filename = $this->safeBaseName($imgMedia->original_name).'-decompressed.png';
        $disposition = $request->boolean('download') ? 'attachment' : 'inline';

        return response($bytes, 200, [
            'Content-Type' => $image['mime_type'],
            'Content-Length' => (string) strlen($bytes),
            'Content-Disposition' => "{$disposition}; filename=\"{$filename}\"",
            'Cache-Control' => 'no-store',
        ]);
    }

    public function heatmap(
        Request $request,
        ImgMedia $imgMedia,
        MLConnector $mlConnector,
        ImageAnalysisService $imageAnalysis,
    ) {
        $this->authorizeImage($imgMedia);

        abort_if($imgMedia->status !== 'compressed', 404);

        $heatmapPath = $imageAnalysis->heatmapPath($imgMedia);
        if (! $request->boolean('refresh') && Storage::exists($heatmapPath)) {
            return Storage::response($heatmapPath, $this->safeBaseName($imgMedia->original_name).'-heatmap.png', [
                'Content-Type' => 'image/png',
                'Cache-Control' => 'no-store',
            ]);
        }

        $decompressed = $this->decompressedImage($imgMedia, $mlConnector);
        $heatmap = $imageAnalysis->generateHeatmap($imgMedia, $decompressed['bytes']);
        $metrics = $imgMedia->quality_metrics ?? [];
        $metrics['heatmap'] = $heatmap;

        $imgMedia->update([
            'quality_metrics' => $metrics,
        ]);

        return Storage::response($heatmap['path'], $this->safeBaseName($imgMedia->original_name).'-heatmap.png', [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'no-store',
        ]);
    }

    private function decompressedImage(ImgMedia $imgMedia, MLConnector $mlConnector): array
    {
        abort_if($imgMedia->status !== 'compressed', 404);
        abort_if($imgMedia->modelVersion === null, 404);
        abort_if($imgMedia->compressed_img_path === null || ! Storage::exists($imgMedia->compressed_img_path), 404);

        $result = $mlConnector->decompress(
            $imgMedia->modelVersion,
            new EloquentCollection([$imgMedia]),
        );

        $image = $result['images'][0] ?? null;
        abort_if(! is_array($image) || empty($image['file_base64']), 502);

        if (! empty($image['quality_metrics']) && is_array($image['quality_metrics'])) {
            $metrics = [
                ...($imgMedia->quality_metrics ?? []),
                ...$image['quality_metrics'],
            ];
            $imgMedia->update([
                'quality_metrics' => $metrics,
            ]);
        }

        $bytes = base64_decode($image['file_base64'], true);
        abort_if($bytes === false, 502);

        return [
            'bytes' => $bytes,
            'mime_type' => $image['mime_type'] ?? 'image/png',
            'size' => $image['size'] ?? strlen($bytes),
        ];
    }

    public function store(Request $request, MLAuditLogger $auditLogger)
    {
        $validated = $request->validate([
            'model_version_id' => [
                'required',
                'integer',
                Rule::exists('model_versions', 'id')->where('status', 'ready'),
            ],
            'images' => 'required|array|min:1|max:20',
            'images.*' => 'required|image|max:10240',
        ]);

        $modelVersion = ModelVersion::findOrFail($validated['model_version_id']);

        $images = collect($request->file('images'))
            ->map(fn(UploadedFile $file) => $this->storeImage($file, $modelVersion))
            ->values();

        CompressJob::dispatch(
            $modelVersion->id,
            $images->pluck('id')->all(),
        )->afterCommit();
        $auditLogger->info('compression_batch_queued', [
            'model_version' => $modelVersion,
            'message' => "Compression batch queued for {$images->count()} images.",
            'context' => [
                'image_ids' => $images->pluck('id')->all(),
            ],
        ]);

        return $this->responseFor($request, [
            'message' => 'Images uploaded and queued for compression.',
            'data' => $images,
        ]);
    }

    public function update(Request $request, ImgMedia $imgMedia)
    {
        $this->authorizeImage($imgMedia);

        $validated = $request->validate([
            'original_name' => 'required|string|max:255',
            'model_version_id' => [
                'nullable',
                'integer',
                Rule::exists('model_versions', 'id')->where('status', 'ready'),
            ],
        ]);

        $imgMedia->update($validated);

        return $this->responseFor($request, [
            'message' => 'Image updated successfully.',
            'data' => $imgMedia->fresh(['author', 'modelVersion.model']),
        ]);
    }

    public function destroy(Request $request, ImgMedia $imgMedia, MLAuditLogger $auditLogger)
    {
        $this->authorizeImage($imgMedia);

        $this->deleteImageFiles($imgMedia);
        $auditLogger->info('compression_image_deleted', [
            'img_media' => $imgMedia,
            'model_version_id' => $imgMedia->model_version_id,
            'message' => "Compression image {$imgMedia->original_name} deleted.",
        ]);
        $imgMedia->delete();

        return $this->responseFor($request, [
            'message' => 'Image deleted successfully.',
        ]);
    }

    public function cancel(
        Request $request,
        ModelVersion $modelVersion,
        MLConnector $mlConnector,
        MLAuditLogger $auditLogger,
    )
    {
        $validated = $request->validate([
            'image_ids' => 'nullable|array',
            'image_ids.*' => 'integer|exists:img_media,id',
        ]);

        $images = ImgMedia::query()
            ->where('author_id', Auth::id())
            ->where('model_version_id', $modelVersion->id)
            ->whereIn('status', ['just created', 'compressing'])
            ->when(
                array_key_exists('image_ids', $validated),
                fn($query) => $query->whereIn('id', $validated['image_ids']),
            )
            ->get();

        if ($images->isEmpty()) {
            $auditLogger->warning('compression_cancel_skipped', [
                'model_version' => $modelVersion,
                'message' => 'Compression cancel skipped because no active images were found.',
                'context' => [
                    'requested_image_ids' => $validated['image_ids'] ?? null,
                ],
            ]);

            return $this->responseFor($request, [
                'message' => 'No active compression images found.',
                'data' => [],
            ]);
        }

        $pendingImages = $images->where('status', 'just created');
        $runningImages = $images->where('status', 'compressing');

        $pendingImages->each->update([
            'status' => 'cancel',
            'errors' => '',
        ]);
        $auditLogger->info('compression_cancel_local', [
            'model_version' => $modelVersion,
            'message' => "Compression cancel requested for {$images->count()} images.",
            'context' => [
                'pending_image_ids' => $pendingImages->pluck('id')->all(),
                'running_image_ids' => $runningImages->pluck('id')->all(),
            ],
        ]);

        if ($runningImages->isNotEmpty()) {
            $mlConnector->cancelCompression($modelVersion, $runningImages);
        }

        return $this->responseFor($request, [
            'message' => 'Compression cancelled successfully.',
            'data' => ImgMedia::query()
                ->whereIn('id', $images->pluck('id'))
                ->get(),
        ]);
    }

    public function retry(Request $request, ImgMedia $imgMedia, MLAuditLogger $auditLogger)
    {
        $this->authorizeImage($imgMedia);

        abort_if($imgMedia->modelVersion === null || $imgMedia->modelVersion->status !== 'ready', 404);
        abort_if($imgMedia->img_path === null || ! Storage::exists($imgMedia->img_path), 404);

        $imgMedia->update([
            'status' => 'just created',
            'errors' => '',
            'quality_metrics' => null,
        ]);
        Storage::deleteDirectory("ml/analysis/img-media-{$imgMedia->id}");

        CompressJob::dispatch(
            $imgMedia->model_version_id,
            [$imgMedia->id],
        )->afterCommit();
        $auditLogger->info('compression_image_retried', [
            'img_media' => $imgMedia,
            'model_version_id' => $imgMedia->model_version_id,
            'message' => "Compression retry queued for {$imgMedia->original_name}.",
        ]);

        return $this->responseFor($request, [
            'message' => 'Image queued for compression retry.',
            'data' => $imgMedia->fresh(['author', 'modelVersion.model']),
        ]);
    }

    private function storeImage(UploadedFile $file, ModelVersion $modelVersion): ImgMedia
    {
        $image = ImgMedia::create([
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'original_size' => $file->getSize() ?? 0,
            'author_id' => Auth::id(),
            'model_version_id' => $modelVersion->id,
            'status' => 'just created',
            'errors' => '',
        ]);

        $image->update([
            'img_path' => Storage::putFile("img-media/{$image->id}", $file),
        ]);

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

    private function authorizeImage(ImgMedia $imgMedia): void
    {
        abort_if($imgMedia->author_id !== Auth::id(), 404);
    }

    private function safeBaseName(string $filename): string
    {
        $baseName = pathinfo($filename, PATHINFO_FILENAME) ?: 'image';

        return preg_replace('/[^A-Za-z0-9._-]+/', '_', $baseName) ?: 'image';
    }

    private function responseFor(Request $request, array $payload)
    {
        return Redirect::back()->with('message', $payload['message']);
    }

    private function ensureBaselineComparison(ImgMedia $imgMedia): void
    {
        if ($imgMedia->status !== 'compressed') {
            return;
        }

        $imageAnalysis = app(ImageAnalysisService::class);
        if ($imageAnalysis->hasBaselineComparison($imgMedia->quality_metrics)) {
            return;
        }

        try {
            $imgMedia->update([
                'quality_metrics' => $imageAnalysis->appendBaselineComparison($imgMedia),
            ]);
        } catch (\Throwable $exception) {
            $metrics = $imgMedia->quality_metrics ?? [];
            $metrics['baseline_error'] = $exception->getMessage();
            $imgMedia->update([
                'quality_metrics' => $metrics,
            ]);
        }
    }
}
