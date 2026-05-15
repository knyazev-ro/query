<?php

namespace App\Http\Controllers;

use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Services\MLConnector;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Throwable;

class MLDiagnosticsController extends Controller
{
    public function index(MLConnector $mlConnector)
    {
        $health = null;
        $healthError = null;

        try {
            $health = $mlConnector->healthcheck();
        } catch (Throwable $exception) {
            $healthError = $exception->getMessage();
        }

        return Inertia::render('MLDiagnostics/Main', [
            'diagnostics' => [
                'available' => $health !== null,
                'health' => $health,
                'health_error' => $healthError,
                'laravel_storage' => $this->laravelStorageStatus(),
                'latest_training_errors' => $this->latestTrainingErrors(),
                'latest_compression_errors' => $this->latestCompressionErrors(),
                'checked_at' => now()->toISOString(),
            ],
        ]);
    }

    private function laravelStorageStatus(): array
    {
        $root = Storage::path('');
        $privateRoot = storage_path('app/private');

        return [
            'disk' => config('filesystems.default'),
            'root' => $root,
            'private_root' => $privateRoot,
            'root_exists' => File::isDirectory($root),
            'root_writable' => File::isWritable($root),
            'private_root_exists' => File::isDirectory($privateRoot),
            'private_root_writable' => File::isWritable($privateRoot),
        ];
    }

    private function latestTrainingErrors()
    {
        return ModelVersion::query()
            ->with('model:id,name')
            ->whereNotNull('errors')
            ->where('errors', '!=', '')
            ->latest('updated_at')
            ->limit(8)
            ->get([
                'id',
                'img_compress_model_id',
                'version_number',
                'status',
                'errors',
                'updated_at',
            ]);
    }

    private function latestCompressionErrors()
    {
        return ImgMedia::query()
            ->with('modelVersion.model:id,name')
            ->whereNotNull('errors')
            ->where('errors', '!=', '')
            ->latest('updated_at')
            ->limit(8)
            ->get([
                'id',
                'model_version_id',
                'original_name',
                'status',
                'errors',
                'updated_at',
            ]);
    }
}
