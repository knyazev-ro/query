<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;
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

    /**
     * Inspect a dataset archive without trusting user-provided image counts.
     *
     * @return array{
     *     images_count:int,
     *     supported_files_count:int,
     *     broken_files:array<int,string>,
     *     empty_directories:array<int,string>,
     *     resolutions:array<int,string>,
     *     format_counts:array<string,int>,
     *     size_buckets:array<string,int>,
     *     min_width:int|null,
     *     min_height:int|null,
     *     max_width:int|null,
     *     max_height:int|null,
     *     avg_width:float|null,
     *     avg_height:float|null
     * }
     */
    public function inspectDatasetArchive(string|UploadedFile $path): array
    {
        $archivePath = $path instanceof UploadedFile
            ? $path->getRealPath()
            : $this->resolvePath($path);

        if ($archivePath === false || $archivePath === null || ! File::exists($archivePath)) {
            throw new RuntimeException('Dataset archive does not exist.');
        }

        $zip = new ZipArchive();
        if ($zip->open($archivePath) !== true) {
            throw new RuntimeException('Dataset archive could not be opened.');
        }

        $directories = [];
        $imageEntries = [];
        $brokenFiles = [];
        $resolutions = [];
        $resolutionCounts = [];
        $formatCounts = [];
        $sizeBuckets = [
            '<=128px' => 0,
            '129-256px' => 0,
            '257-512px' => 0,
            '513-1024px' => 0,
            '>1024px' => 0,
        ];
        $minWidth = null;
        $minHeight = null;
        $maxWidth = null;
        $maxHeight = null;
        $widthSum = 0;
        $heightSum = 0;
        $readableImagesCount = 0;
        $totalEntries = $zip->numFiles;

        try {
            for ($index = 0; $index < $zip->numFiles; $index++) {
                $entry = $zip->getNameIndex($index);

                if ($entry === false || $this->isUnsafeZipEntry($entry)) {
                    throw new RuntimeException('Dataset archive contains an unsafe entry.');
                }

                $normalized = trim(str_replace('\\', '/', $entry), '/');
                if ($normalized === '' || $normalized === '__MACOSX' || str_starts_with($normalized, '__MACOSX/')) {
                    continue;
                }

                if (str_ends_with($entry, '/')) {
                    $directories[] = $normalized.'/';
                    continue;
                }

                if (! $this->isSupportedImageEntry($normalized)) {
                    continue;
                }

                $imageEntries[] = $normalized;
                $extension = strtolower(pathinfo($normalized, PATHINFO_EXTENSION));
                $formatCounts[$extension] = ($formatCounts[$extension] ?? 0) + 1;
                $contents = $zip->getFromIndex($index);
                $imageInfo = is_string($contents) ? @getimagesizefromstring($contents) : false;

                if ($imageInfo === false) {
                    $brokenFiles[] = $normalized;
                    continue;
                }

                [$width, $height] = $imageInfo;
                $resolutions["{$width}x{$height}"] = true;
                $resolutionCounts["{$width}x{$height}"] = ($resolutionCounts["{$width}x{$height}"] ?? 0) + 1;
                $minWidth = $minWidth === null ? $width : min($minWidth, $width);
                $minHeight = $minHeight === null ? $height : min($minHeight, $height);
                $maxWidth = $maxWidth === null ? $width : max($maxWidth, $width);
                $maxHeight = $maxHeight === null ? $height : max($maxHeight, $height);
                $widthSum += $width;
                $heightSum += $height;
                $readableImagesCount++;

                $longestSide = max($width, $height);
                $bucket = match (true) {
                    $longestSide <= 128 => '<=128px',
                    $longestSide <= 256 => '129-256px',
                    $longestSide <= 512 => '257-512px',
                    $longestSide <= 1024 => '513-1024px',
                    default => '>1024px',
                };
                $sizeBuckets[$bucket]++;
            }
        } finally {
            $zip->close();
        }

        $emptyDirectories = array_values(array_filter(
            $directories,
            fn (string $directory) => ! collect($imageEntries)
                ->contains(fn (string $entry) => str_starts_with($entry, $directory)),
        ));

        return [
            'images_count' => $readableImagesCount,
            'supported_files_count' => count($imageEntries),
            'total_entries' => $totalEntries,
            'broken_files' => $brokenFiles,
            'broken_files_count' => count($brokenFiles),
            'empty_directories' => $emptyDirectories,
            'empty_directories_count' => count($emptyDirectories),
            'resolutions' => array_keys($resolutions),
            'resolution_counts' => $resolutionCounts,
            'format_counts' => $formatCounts,
            'size_buckets' => $sizeBuckets,
            'min_width' => $minWidth,
            'min_height' => $minHeight,
            'max_width' => $maxWidth,
            'max_height' => $maxHeight,
            'avg_width' => $readableImagesCount > 0 ? round($widthSum / $readableImagesCount, 2) : null,
            'avg_height' => $readableImagesCount > 0 ? round($heightSum / $readableImagesCount, 2) : null,
        ];
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

    private function isSupportedImageEntry(string $entry): bool
    {
        return preg_match('~\.(jpe?g|png|bmp|webp|tiff?)$~i', $entry) === 1;
    }
}
