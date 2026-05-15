<?php

namespace App\Http\Controllers;

use App\Models\Dataset;
use App\Models\ImgCompressModel;
use App\Models\ModelVersion;
use App\Services\MLConnector;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ImgCompressModelController extends Controller
{
    public function index(Request $request)
    {
        $models = ImgCompressModel::query()
            ->with(['author', 'latestVersion.datasets'])
            ->withCount('versions')
            ->latest()
            ->paginate(12);

        if ($request->has('page')) {
            return $models;
        }

        return Inertia::render('ImgCompressModels/Main', compact('models'));
    }

    public function show(ImgCompressModel $imgCompressModel)
    {
        return $imgCompressModel->load([
            'author',
            'versions' => fn($query) => $query->with(['author', 'parentVersion', 'datasets'])->orderBy('version_number'),
        ]);
    }

    public function createModel()
    {
        $datasets = Dataset::query()
            ->select('id', 'name', 'image_resolution', 'images_count', 'train_split', 'test_split', 'profile')
            ->latest()
            ->get();

        return Inertia::render('ImgCompressModels/Create', compact('datasets'));
    }

    public function storeModel(Request $request)
    {
        $validated = $request->validate([
            ...$this->modelRules(),
            ...$this->versionRules(requireDatasets: true),
        ]);

        DB::transaction(function () use ($validated) {
            $model = ImgCompressModel::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'author_id' => Auth::id(),
            ]);

            $version = $model->versions()->create([
                'version_number' => 1,
                'image_resolution' => $validated['image_resolution'] ?? 256,
                'status' => $validated['status'] ?? 'queue',
                'author_id' => Auth::id(),
                'errors' => $validated['errors'] ?? null,
            ]);

            $version->datasets()->sync($validated['dataset_ids']);
        });

        return Redirect::back()->with('message', 'Image compression model created successfully.');
    }

    public function updateModel(Request $request, ImgCompressModel $imgCompressModel)
    {
        $imgCompressModel->update($request->validate($this->modelRules()));

        return Redirect::back()->with('message', 'Image compression model updated successfully.');
    }

    public function editVersion(ImgCompressModel $imgCompressModel)
    {
        $imgCompressModel->load([
            'versions' => fn($query) => $query
                ->with(['parentVersion', 'datasets', 'imgMedia'])
                ->orderBy('version_number'),
        ]);

        $this->appendVersionExperimentStats($imgCompressModel->versions);

        $datasets = Dataset::query()
            ->select('id', 'name', 'image_resolution', 'images_count', 'train_split', 'test_split', 'profile')
            ->latest()
            ->get();

        return Inertia::render('ImgCompressModels/EditVersion', compact('imgCompressModel', 'datasets'));
    }

    public function createNewVersionFrom(Request $request, ?ModelVersion $modelVersion = null)
    {
        $validated = $request->validate([
            'img_compress_model_id' => [
                Rule::requiredIf($modelVersion === null),
                'integer',
                'exists:img_compress_models,id',
            ],
            ...$this->versionRules(requireDatasets: $modelVersion === null),
        ]);

        $version = DB::transaction(function () use ($validated, $modelVersion) {
            $modelId = $modelVersion?->img_compress_model_id ?? $validated['img_compress_model_id'];

            $nextNumber = ModelVersion::query()
                ->where('img_compress_model_id', $modelId)
                ->max('version_number') + 1;

            $version = ModelVersion::create([
                'img_compress_model_id' => $modelId,
                'parent_version_id' => $modelVersion?->id,
                'version_number' => $nextNumber,
                'image_resolution' => $validated['image_resolution'] ?? $modelVersion?->image_resolution ?? 256,
                'status' => $validated['status'] ?? 'queue',
                'author_id' => Auth::id(),
                'errors' => $validated['errors'] ?? null,
            ]);

            $datasetIds = collect($modelVersion?->datasets()->pluck('datasets.id')->all() ?? [])
                ->merge($validated['dataset_ids'] ?? [])
                ->unique()
                ->values()
                ->all();

            $version->datasets()->sync($datasetIds);

            return $version;
        });

        return Redirect::back()
            ->with('message', "Version {$version->version_number} created successfully.");
    }

    public function updateVersion(Request $request, ModelVersion $modelVersion)
    {
        $validated = $request->validate($this->versionRules());

        $modelVersion->update([
            'image_resolution' => $validated['image_resolution'] ?? $modelVersion->image_resolution,
            'status' => $validated['status'] ?? $modelVersion->status,
            'errors' => $validated['errors'] ?? $modelVersion->errors,
        ]);

        if (array_key_exists('dataset_ids', $validated)) {
            $modelVersion->datasets()->sync($validated['dataset_ids']);
        }

        return Redirect::back()->with('message', 'Version updated successfully.');
    }

    public function retryVersion(ModelVersion $modelVersion)
    {
        abort_if($modelVersion->datasets()->count() === 0, 422, 'Version has no datasets.');

        $modelVersion->update([
            'status' => 'queue',
            'errors' => null,
            'progress' => null,
            'quality_metrics' => null,
            'training_started_at' => null,
            'training_finished_at' => null,
            'training_report' => null,
        ]);

        return Redirect::back()->with('message', "Version {$modelVersion->version_number} queued for retry.");
    }

    public function cancelVersion(ModelVersion $modelVersion, MLConnector $mlConnector)
    {
        $this->cancelActiveTraining($modelVersion, $mlConnector);

        return Redirect::back()->with('message', "Version {$modelVersion->version_number} training cancelled.");
    }

    public function deleteVersion(ModelVersion $modelVersion, MLConnector $mlConnector)
    {
        $this->cancelActiveTraining($modelVersion, $mlConnector);
        $this->deleteVersionArtifacts($modelVersion);

        $modelVersion->delete();

        return Redirect::back()->with('message', 'Version deleted successfully.');
    }

    public function deleteModel(ImgCompressModel $imgCompressModel, MLConnector $mlConnector)
    {
        $imgCompressModel->load('versions');

        foreach ($imgCompressModel->versions as $version) {
            $this->cancelActiveTraining($version, $mlConnector);
            $this->deleteVersionArtifacts($version);
        }

        $imgCompressModel->delete();

        return Redirect::back()->with('message', 'Image compression model deleted successfully.');
    }

    private function cancelActiveTraining(ModelVersion $modelVersion, MLConnector $mlConnector): void
    {
        if ($modelVersion->status === 'run') {
            $mlConnector->cancelTrain($modelVersion);
            return;
        }

        if ($modelVersion->status === 'queue') {
            $modelVersion->update([
                'status' => 'cancel',
                'errors' => null,
            ]);
        }
    }

    private function deleteVersionArtifacts(ModelVersion $modelVersion): void
    {
        Storage::deleteDirectory("ml/models/model-version-{$modelVersion->id}");
    }

    private function appendVersionExperimentStats($versions): void
    {
        $versions->each(function (ModelVersion $version): void {
            $images = $version->imgMedia;
            $compressed = $images->where('status', 'compressed');
            $originalSize = (int) $compressed->sum('original_size');
            $compressedSize = (int) $compressed->sum('compressed_size');
            $metrics = $compressed
                ->pluck('quality_metrics')
                ->filter(fn ($value) => is_array($value));

            $averageMetric = fn (string $key) => $metrics
                ->map(fn (array $metric) => $metric[$key] ?? null)
                ->filter(fn ($value) => is_numeric($value))
                ->avg();

            $version->setAttribute('compression_stats', [
                'images_count' => $images->count(),
                'compressed_count' => $compressed->count(),
                'original_size' => $originalSize,
                'compressed_size' => $compressedSize,
                'compression_ratio' => $originalSize > 0 ? round($compressedSize / $originalSize, 6) : null,
                'saved_percent' => $originalSize > 0 ? round(100 - ($compressedSize / $originalSize * 100), 2) : null,
                'avg_psnr' => $averageMetric('psnr'),
                'avg_ssim' => $averageMetric('ssim'),
                'avg_mse' => $averageMetric('mse'),
            ]);
            $version->unsetRelation('imgMedia');
        });
    }

    private function modelRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ];
    }

    private function versionRules(bool $requireDatasets = false): array
    {
        return [
            'dataset_ids' => [$requireDatasets ? 'required' : 'sometimes', 'array'],
            'dataset_ids.*' => 'integer|exists:datasets,id',
            'image_resolution' => 'nullable|integer|in:64,128,256,512',
            'status' => 'nullable|string|in:queue,run,ready,cancel,error',
            'errors' => 'nullable|string',
        ];
    }
}
