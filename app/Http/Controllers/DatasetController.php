<?php

namespace App\Http\Controllers;

use App\Models\Dataset;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Throwable;

class DatasetController extends Controller
{
    public function index(Request $request)
    {
        $datasets = Dataset::with('author')
            ->latest()
            ->paginate(12);

        if ($request->has('page')) {
            return $datasets;
        }

        return Inertia::render('Datasets/Main', compact('datasets'));
    }

    public function show(Dataset $dataset)
    {
        $dataset->load('author');

        return $dataset;
    }

    public function create()
    {
        return Inertia::render('Datasets/Create');
    }

    public function store(Request $request)
    {
        $validated = $this->validateDataset($request);

        if (($validated['train_split'] + $validated['test_split']) !== 100) {
            throw ValidationException::withMessages([
                'train_split' => 'Train and test split sum must be 100.',
            ]);
        }

        $file = $request->file('dataset');
        $archiveInfo = $this->inspectArchive($file, (int) $validated['image_resolution']);
        $path = $file->store('datasets');
        $validated['name'] = $validated['name'] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        unset($validated['dataset']);

        Dataset::create([
            ...$validated,
            'author_id' => Auth::id(),
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'images_count' => $archiveInfo['images_count'],
            'profile' => $archiveInfo,
        ]);

        return Redirect::back()->with('message', 'Dataset uploaded successfully.');
    }

    public function update(Request $request, Dataset $dataset)
    {
        $validated = $this->validateDataset($request, false);

        if (($validated['train_split'] + $validated['test_split']) !== 100) {
            throw ValidationException::withMessages([
                'train_split' => 'Train and test split sum must be 100.',
            ]);
        }
        $validated['name'] = $validated['name'] ?? $dataset->name;

        if ($request->hasFile('dataset')) {
            $archiveInfo = $this->inspectArchive($request->file('dataset'), (int) $validated['image_resolution']);
            Storage::delete($dataset->file_path);

            $file = $request->file('dataset');
            $validated['file_path'] = $file->store('datasets');
            $validated['original_filename'] = $file->getClientOriginalName();
            $validated['file_size'] = $file->getSize();
            $validated['mime_type'] = $file->getMimeType();
            $validated['images_count'] = $archiveInfo['images_count'];
            $validated['profile'] = $archiveInfo;
        }
        unset($validated['dataset']);

        $dataset->update($validated);

        return Redirect::back()->with('message', 'Dataset updated successfully.');
    }

    public function destroy(Dataset $dataset)
    {
        Storage::delete($dataset->file_path);
        $dataset->delete();

        return Redirect::back();
    }

    public function loadDataset(Request $request)
    {
        return $this->store($request);
    }

    private function validateDataset(Request $request, bool $requireFile = true): array
    {
        return $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'dataset' => [$requireFile ? 'required' : 'nullable', 'file', 'mimes:zip'],
            'rotation_degree' => 'required|integer|min:0|max:360',
            'do_flip' => 'required|boolean',
            'image_resolution' => 'required|integer|in:64,128,256,512',
            'train_split' => 'required|integer|min:0|max:100',
            'test_split' => 'required|integer|min:0|max:100',
            'uses_count' => 'nullable|integer|min:0',
        ]);
    }

    private function inspectArchive($file, int $imageResolution): array
    {
        try {
            $info = app(FileService::class)->inspectDatasetArchive($file);
        } catch (Throwable $exception) {
            throw ValidationException::withMessages([
                'dataset' => $exception->getMessage(),
            ]);
        }
        $messages = [];

        if ($info['images_count'] <= 0) {
            $messages[] = 'Dataset archive must contain at least one readable image.';
        }

        if ($info['broken_files'] !== []) {
            $sample = implode(', ', array_slice($info['broken_files'], 0, 5));
            $messages[] = "Broken image files detected: {$sample}.";
        }

        if ($info['empty_directories'] !== []) {
            $sample = implode(', ', array_slice($info['empty_directories'], 0, 5));
            $messages[] = "Empty folders detected: {$sample}.";
        }

        if (
            $info['min_width'] !== null
            && $info['min_height'] !== null
            && ($info['min_width'] < $imageResolution || $info['min_height'] < $imageResolution)
        ) {
            $messages[] = "Some images are smaller than {$imageResolution}x{$imageResolution}; minimum found is {$info['min_width']}x{$info['min_height']}.";
        }

        if ($messages !== []) {
            throw ValidationException::withMessages([
                'dataset' => implode(' ', $messages),
            ]);
        }

        return $info;
    }
}
