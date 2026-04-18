<?php

namespace App\Utils;

use App\DTO\Files;
use App\Models\FileLocation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FileManager
{
    public static function store(Model $model, UploadedFile $file, string $directory, ?int $author_id = null): FileLocation
    {
        $path = $file->storeAs($directory, now()->format('Y-m-d h-i-s').' '.$file->getClientOriginalName());

        return FileLocation::create([
            'entity_type' => $model::class,
            'entity_id' => $model->id,
            'author_id' => $author_id,
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'ext' => $file->getClientOriginalExtension(),
        ]);
    }

    public static function delete(int $id): void
    {
        $fileLocation = FileLocation::findOrFail($id);
        Storage::delete($fileLocation->path);
        $fileLocation->delete();
    }

    /**
     * updateAttachedFiles
     *
     * @param  Model  $model
     * @param  Files[]  $files
     */
    public static function updateAttachedFiles(
        Model $model,
        array $files,
        ?int $author_id = null,
        string $dir = 'default'
    ): void {
        // Implementation for attaching files to a commentary
        collect($files)
            ->map(function (Files $fileDto) use ($model, $dir, $author_id) {
                // Logic to attach or detach files based on $fileDto properties
                if ($fileDto->toDelete) {
                    // Detach file logic
                    FileManager::delete($fileDto->id);

                    return $fileDto;
                }
                if (! $fileDto->file) {
                    return $fileDto;
                }
                if ($fileDto->file instanceof UploadedFile) {
                    $fileLocationInstance = FileManager::store(
                        model: $model,
                        file: $fileDto->file,
                        directory: $dir,
                        author_id: $author_id
                    );

                    $fileDto->id = $fileLocationInstance->id;
                }

                return $fileDto;
            })->filter(fn ($file) => ! $file->toDelete);

    }
}
