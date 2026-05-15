<?php

namespace App\Http\Controllers;

use App\Models\ImgMedia;
use App\Models\ModelVersion;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * [Description CallbackController]
 * Этот контроллер - открытое АПИ должно быть вне авторизации пока что. микросервис на питоне запускает колбеки при ошибке, при старте обучения или процесса сжатия изображения или же при завершении обучения или сжатия
 */
class CallbackController extends Controller
{
    /**
     * [Description for compressionProcess]
     * our python ml microservice could fire callback with change status/write info about errors or successfully send compressed image app_path()
     * we should save it because laravel is the center the TRUTH and only laravel has access to DB
     *
     * @param Request $request
     * 
     * @return [type]
     * 
     */
    public function compressionProcess(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer|exists:img_media,id',
            'errors' => 'nullable|string',
            'status' => ['required', 'string', Rule::in([
                'just created',
                'compressing',
                'compressed',
                'error',
                'cancel',
            ])],
            'compressed_path' => 'required_if:status,compressed|nullable|string',
            'compressed_size' => 'nullable|integer|min:0',
            'quality_metrics' => 'nullable|array',
        ]);

        $imgMedia = ImgMedia::findOrFail($validated['id']);

        $updateData = [
            'status' => $validated['status'],
            'errors' => $validated['errors'] ?? '',
        ];

        if ($validated['status'] === 'compressed') {
            $updateData['compressed_img_path'] = $validated['compressed_path'];
            $updateData['quality_metrics'] = $validated['quality_metrics'] ?? $imgMedia->quality_metrics;

            if (array_key_exists('compressed_size', $validated)) {
                $updateData['compressed_size'] = $validated['compressed_size'];
            }
        }

        $imgMedia->update($updateData);

        return response()->json([
            'message' => 'Compression status updated successfully.',
            'data' => $imgMedia->fresh(),
        ]);
    }

    public function trainProcess(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|integer',
            'errors' => 'nullable|string',
            'status' => ['required', 'string', Rule::in([
                'queue',
                'run',
                'ready',
                'cancel',
                'error',
            ])],
            'progress' => 'nullable|array',
            'quality_metrics' => 'nullable|array',
        ]);

        $modelVersion = ModelVersion::find($validated['id']);

        if ($modelVersion === null) {
            return response()->json([
                'message' => 'Training callback ignored because model version no longer exists.',
            ]);
        }

        $updates = [
            'status' => $validated['status'],
            'errors' => $validated['errors'] ?? null,
            'progress' => $validated['progress'] ?? $modelVersion->progress,
            'quality_metrics' => $validated['quality_metrics'] ?? $modelVersion->quality_metrics,
            'training_report' => $this->trainingReportFromCallback($modelVersion, $validated),
        ];

        if ($validated['status'] === 'run' && $modelVersion->training_started_at === null) {
            $updates['training_started_at'] = now();
        }

        if (in_array($validated['status'], ['ready', 'cancel', 'error'], true)) {
            $updates['training_finished_at'] = now();
        }

        $modelVersion->update($updates);

        return response()->json([
            'message' => 'Training status updated successfully.',
            'data' => $modelVersion->fresh(),
        ]);
    }

    private function trainingReportFromCallback(ModelVersion $modelVersion, array $validated): array
    {
        $modelVersion->loadMissing(['datasets', 'model']);

        $report = $modelVersion->training_report ?? [];
        $progress = $validated['progress'] ?? null;
        $status = $validated['status'];
        $now = now();

        $report['status'] = $status;
        $report['started_at'] ??= $modelVersion->training_started_at?->toISOString();
        $report['parameters'] ??= [
            'image_resolution' => $modelVersion->image_resolution,
            'train_epochs' => $progress['total_epochs'] ?? null,
            'train_batch_size' => config('services.img_compress_ml.train_batch_size'),
        ];
        $report['model'] ??= [
            'id' => $modelVersion->img_compress_model_id,
            'name' => $modelVersion->model?->name,
            'version_number' => $modelVersion->version_number,
            'parent_version_id' => $modelVersion->parent_version_id,
        ];
        $report['datasets'] ??= $modelVersion->datasets
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
            ->all();

        if (is_array($progress)) {
            $report['latest_progress'] = $progress;

            if (! empty($progress['losses']) && is_array($progress['losses'])) {
                $history = $report['loss_history'] ?? [];
                $history[] = [
                    'at' => $progress['updated_at'] ?? $now->toISOString(),
                    'percent' => $progress['percent'] ?? null,
                    'epoch' => $progress['current_epoch'] ?? null,
                    'step' => $progress['current_step'] ?? null,
                    'losses' => $progress['losses'],
                ];
                $report['loss_history'] = array_slice($history, -500);
            }

            if (! empty($progress['quality_metrics']) && is_array($progress['quality_metrics'])) {
                $report['quality_metrics'] = $progress['quality_metrics'];
            }
        }

        if (! empty($validated['quality_metrics']) && is_array($validated['quality_metrics'])) {
            $report['quality_metrics'] = $validated['quality_metrics'];
        }

        if (in_array($status, ['ready', 'cancel', 'error'], true)) {
            $report['finished_at'] = $now->toISOString();
            $startedAt = $modelVersion->training_started_at;
            $report['duration_seconds'] = $startedAt === null ? null : max($startedAt->diffInSeconds($now), 0);
        }

        $report['errors'] = $validated['errors'] ?? null;

        return $report;
    }
}
