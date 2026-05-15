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
            'id' => 'required|integer|exists:model_versions,id',
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

        $modelVersion = ModelVersion::findOrFail($validated['id']);

        $modelVersion->update([
            'status' => $validated['status'],
            'errors' => $validated['errors'] ?? null,
            'progress' => $validated['progress'] ?? $modelVersion->progress,
            'quality_metrics' => $validated['quality_metrics'] ?? $modelVersion->quality_metrics,
        ]);

        return response()->json([
            'message' => 'Training status updated successfully.',
            'data' => $modelVersion->fresh(),
        ]);
    }
}
