<?php

namespace App\Http\Controllers;

use App\Models\Dataset;
use App\Models\ImgCompressModel;
use App\Models\ModelVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
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
            'versions' => fn ($query) => $query->with(['author', 'parentVersion', 'datasets'])->orderBy('version_number'),
        ]);
    }

    public function createModel()
    {
        $datasets = Dataset::query()
            ->select('id', 'name', 'image_resolution', 'images_count')
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
            'versions' => fn ($query) => $query->with(['parentVersion', 'datasets'])->orderBy('version_number'),
        ]);

        $datasets = Dataset::query()
            ->select('id', 'name', 'image_resolution', 'images_count')
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

    public function deleteVersion(ModelVersion $modelVersion)
    {
        $modelVersion->delete();

        return Redirect::back()->with('message', 'Version deleted successfully.');
    }

    public function deleteModel(ImgCompressModel $imgCompressModel)
    {
        $imgCompressModel->delete();

        return Redirect::back()->with('message', 'Image compression model deleted successfully.');
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
            'status' => 'nullable|string|in:queue,training,ready,cancel,error',
            'errors' => 'nullable|string',
        ];
    }
}
