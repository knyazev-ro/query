<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use RuntimeException;
use ZipArchive;
use ZanySoft\Zip\Facades\Zip;

class FileService
{
    public function getTmpFolder(): string
    {
        $path = storage_path('tmp');
        if (! File::isDirectory($path)) {
            File::makeDirectory($path, 0755, true);
        }

        return $path;
    }

    public function base64ToImg(string $folder, string ...$b64Images): array
    {
        if (! File::isDirectory($folder)) {
            File::makeDirectory($folder, 0755, true);
        }

        $paths = [];
        foreach ($b64Images as $b64Img) {
            $img = Image::decodeBase64($b64Img);
            $name = Str::uuid().'.png';
            $path = "{$folder}/{$name}";
            $img->save($path);
            $paths[] = $path;
        }
        return $paths;
    }

    public function makeZip(string ...$paths)
    {
        $tmp = $this->getTmpFolder();
        $name = sprintf(
            'u %s archive %s.zip',
            Auth::user()?->name ?? 'guest',
            now()->format('Y-m-d H i s')
        );
        $zipPath = "{$tmp}/$name";
        $zip = Zip::create($zipPath);
        foreach ($paths as $path) {
            $zip->add($path);
        }
        $zip->close();
        return $zipPath;
    }

    /**
     * [Description for b64ToZip]
     * ususally for decompress operation
     * @param string ...$b64Images
     * 
     * @return [type]
     * 
     */
    public function b64ToZip(string ...$b64Images): string
    {
        $tmp = $this->getTmpFolder();
        $paths = $this->base64ToImg($tmp, ...$b64Images);
        $zipPath = $this->makeZip(...$paths);
        foreach ($paths as $path) {
            File::delete($path);
        }

        return $zipPath;
    }

    /**
     * [Description for extract]
     * usually for dataset extraction
     * @param string $path
     * 
     * @return [type]
     * 
     */
    public function extract(string $path, ?string $destination = null): string
    {
        $archivePath = $this->resolvePath($path);
        $destination ??= $this->getTmpFolder().DIRECTORY_SEPARATOR.'extract-'.Str::uuid();

        if (! File::exists($archivePath)) {
            throw new RuntimeException("Archive {$path} does not exist.");
        }

        if (! File::isDirectory($destination)) {
            File::makeDirectory($destination, 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($archivePath) !== true) {
            throw new RuntimeException("Archive {$path} could not be opened.");
        }

        $destinationRealPath = realpath($destination);
        if ($destinationRealPath === false) {
            $zip->close();
            throw new RuntimeException("Destination {$destination} could not be prepared.");
        }

        try {
            for ($index = 0; $index < $zip->numFiles; $index++) {
                $entry = $zip->getNameIndex($index);

                if ($entry === false || $this->isUnsafeZipEntry($entry)) {
                    throw new RuntimeException("Archive {$path} contains an unsafe entry.");
                }
            }

            if (! $zip->extractTo($destinationRealPath)) {
                throw new RuntimeException("Archive {$path} could not be extracted.");
            }
        } finally {
            $zip->close();
        }

        return $destinationRealPath;
    }

    private function resolvePath(string $path): string
    {
        if (File::exists($path)) {
            return $path;
        }

        if (Storage::exists($path)) {
            return Storage::path($path);
        }

        return $path;
    }

    private function isUnsafeZipEntry(string $entry): bool
    {
        $normalized = str_replace('\\', '/', $entry);

        return str_starts_with($normalized, '/')
            || preg_match('~(^|/)\.\.(/|$)~', $normalized) === 1
            || preg_match('~^[A-Za-z]:/~', $normalized) === 1;
    }
}
