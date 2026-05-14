<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use ZanySoft\Zip\Facades\Zip;

class FileService
{
    public function getTmpFolder(): string
    {
        $path = storage_path('tmp');
        if (!Storage::directoryExists($path)) {
            Storage::makeDirectory($path);
        }
        return $path;
    }
    public function base64ToImg(string $folder, string ...$b64Images): array
    {
        $paths = [];
        foreach ($b64Images as $b64Img) {
            $img = Image::decodeBase64($b64Img);
            $name = Str::uuid() . ".png";
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
            "u %s archive %s.zip",
            Auth::user()->name,
            now()->format("Y-m-d h i s")
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
    public function b64ToZip(string ...$b64Images)
    {
        $tmp = $this->getTmpFolder();
        $paths = $this->base64ToImg($tmp, ...$b64Images);
        $zipPath = $this->makeZip(...$paths);
        foreach ($paths as $path) {
            Storage::delete($paths);
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
    public function extract(string $path)
    {
        // 
    }
}
