<?php

namespace App\Services;

use App\Models\ImgMedia;
use GdImage;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ImageAnalysisService
{
    private const QUALITY_STEPS = [95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10];

    public function hasBaselineComparison(?array $metrics): bool
    {
        return ! empty($metrics['baselines']['jpeg'])
            || ! empty($metrics['baselines']['webp']);
    }

    public function appendBaselineComparison(ImgMedia $imgMedia, ?array $metrics = null): array
    {
        $metrics ??= $imgMedia->quality_metrics ?? [];

        if ($this->hasBaselineComparison($metrics)) {
            return $metrics;
        }

        $metrics['baselines'] = $this->baselineComparison($imgMedia);
        $metrics['baseline_target_size'] = $imgMedia->compressed_size;
        $metrics['baseline_note'] = 'JPEG/WebP quality chosen by closest size to ML compressed artifact.';

        return $metrics;
    }

    public function baselineComparison(ImgMedia $imgMedia): array
    {
        if ($imgMedia->img_path === null || ! Storage::exists($imgMedia->img_path)) {
            throw new RuntimeException('Original image is not available for baseline comparison.');
        }

        $resolution = $imgMedia->modelVersion?->image_resolution ?? 256;
        $targetSize = $imgMedia->compressed_size;
        $source = $this->preprocessImage(
            $this->imageFromBytes(Storage::get($imgMedia->img_path)),
            $resolution,
        );

        try {
            $baselines = [];

            if (function_exists('imagejpeg')) {
                $baselines['jpeg'] = $this->bestBaselineForFormat($source, 'jpeg', $targetSize);
            }

            if (function_exists('imagewebp')) {
                $baselines['webp'] = $this->bestBaselineForFormat($source, 'webp', $targetSize);
            }

            return [
                ...$baselines,
                'comparison_resolution' => $resolution,
            ];
        } finally {
            imagedestroy($source);
        }
    }

    public function heatmapPath(ImgMedia $imgMedia): string
    {
        return "ml/analysis/img-media-{$imgMedia->id}/heatmap.png";
    }

    public function generateHeatmap(ImgMedia $imgMedia, string $decompressedBytes): array
    {
        if ($imgMedia->img_path === null || ! Storage::exists($imgMedia->img_path)) {
            throw new RuntimeException('Original image is not available for heatmap generation.');
        }

        $resolution = $imgMedia->modelVersion?->image_resolution ?? 256;
        $original = $this->preprocessImage(
            $this->imageFromBytes(Storage::get($imgMedia->img_path)),
            $resolution,
        );
        $restored = $this->preprocessImage($this->imageFromBytes($decompressedBytes), $resolution);
        $heatmap = imagecreatetruecolor($resolution, $resolution);

        if ($heatmap === false) {
            imagedestroy($original);
            imagedestroy($restored);
            throw new RuntimeException('Could not create heatmap canvas.');
        }

        $sumError = 0.0;
        $maxError = 0.0;

        try {
            for ($y = 0; $y < $resolution; $y++) {
                for ($x = 0; $x < $resolution; $x++) {
                    [$or, $og, $ob] = $this->rgbAt($original, $x, $y);
                    [$rr, $rg, $rb] = $this->rgbAt($restored, $x, $y);
                    $error = (abs($or - $rr) + abs($og - $rg) + abs($ob - $rb)) / (255 * 3);
                    $sumError += $error;
                    $maxError = max($maxError, $error);

                    [$hr, $hg, $hb] = $this->heatColor($error);
                    imagesetpixel($heatmap, $x, $y, ($hr << 16) | ($hg << 8) | $hb);
                }
            }

            ob_start();
            imagepng($heatmap);
            $bytes = ob_get_clean();

            if (! is_string($bytes)) {
                throw new RuntimeException('Could not encode heatmap.');
            }

            $path = $this->heatmapPath($imgMedia);
            Storage::put($path, $bytes);

            return [
                'path' => $path,
                'resolution' => $resolution,
                'mean_error' => round($sumError / ($resolution * $resolution), 8),
                'max_error' => round($maxError, 8),
            ];
        } finally {
            imagedestroy($original);
            imagedestroy($restored);
            imagedestroy($heatmap);
        }
    }

    private function bestBaselineForFormat(GdImage $source, string $format, ?int $targetSize): array
    {
        $best = null;

        foreach (self::QUALITY_STEPS as $quality) {
            $bytes = $this->encodeImage($source, $format, $quality);
            $size = strlen($bytes);
            $candidate = $this->imageFromBytes($bytes);

            try {
                $metrics = $this->compareImages($source, $candidate);
            } finally {
                imagedestroy($candidate);
            }

            $distance = $targetSize ? abs($size - $targetSize) : abs($quality - 80);
            $row = [
                'format' => $format,
                'quality' => $quality,
                'size' => $size,
                'target_size' => $targetSize,
                'target_distance' => $targetSize ? $distance : null,
                'target_distance_percent' => $targetSize ? round(($distance / max($targetSize, 1)) * 100, 2) : null,
                ...$metrics,
            ];

            if ($best === null || $distance < $best['distance']) {
                $best = [
                    'distance' => $distance,
                    'row' => $row,
                ];
            }
        }

        return $best['row'];
    }

    private function compareImages(GdImage $source, GdImage $candidate): array
    {
        $width = imagesx($source);
        $height = imagesy($source);

        if (imagesx($candidate) !== $width || imagesy($candidate) !== $height) {
            $candidate = imagescale($candidate, $width, $height);
            if (! $candidate instanceof GdImage) {
                throw new RuntimeException('Could not resize candidate image for comparison.');
            }
        }

        $sumSquared = 0.0;
        $sumX = 0.0;
        $sumY = 0.0;
        $sumX2 = 0.0;
        $sumY2 = 0.0;
        $sumXY = 0.0;
        $pixels = $width * $height;

        for ($y = 0; $y < $height; $y++) {
            for ($x = 0; $x < $width; $x++) {
                [$sr, $sg, $sb] = $this->rgbAt($source, $x, $y);
                [$cr, $cg, $cb] = $this->rgbAt($candidate, $x, $y);

                $dr = ($sr - $cr) / 255;
                $dg = ($sg - $cg) / 255;
                $db = ($sb - $cb) / 255;
                $sumSquared += ($dr * $dr) + ($dg * $dg) + ($db * $db);

                $sourceLuma = (0.299 * $sr + 0.587 * $sg + 0.114 * $sb) / 255;
                $candidateLuma = (0.299 * $cr + 0.587 * $cg + 0.114 * $cb) / 255;
                $sumX += $sourceLuma;
                $sumY += $candidateLuma;
                $sumX2 += $sourceLuma * $sourceLuma;
                $sumY2 += $candidateLuma * $candidateLuma;
                $sumXY += $sourceLuma * $candidateLuma;
            }
        }

        $mse = $sumSquared / ($pixels * 3);
        $psnr = $mse <= 0 ? null : 10 * log10(1 / $mse);
        $meanX = $sumX / $pixels;
        $meanY = $sumY / $pixels;
        $varianceX = max($sumX2 / $pixels - $meanX * $meanX, 0);
        $varianceY = max($sumY2 / $pixels - $meanY * $meanY, 0);
        $covariance = $sumXY / $pixels - $meanX * $meanY;
        $c1 = 0.01 ** 2;
        $c2 = 0.03 ** 2;
        $ssim = (($meanX * $meanY * 2 + $c1) * ($covariance * 2 + $c2))
            / (($meanX ** 2 + $meanY ** 2 + $c1) * ($varianceX + $varianceY + $c2));

        return [
            'mse' => round($mse, 8),
            'psnr' => $psnr === null ? null : round($psnr, 4),
            'ssim' => round(max(min($ssim, 1), -1), 6),
            'samples' => 1,
        ];
    }

    private function preprocessImage(GdImage $image, int $resolution): GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= 0 || $height <= 0) {
            throw new RuntimeException('Invalid image dimensions.');
        }

        if ($width < $height) {
            $resizedWidth = $resolution;
            $resizedHeight = (int) round($height * ($resolution / $width));
        } else {
            $resizedHeight = $resolution;
            $resizedWidth = (int) round($width * ($resolution / $height));
        }

        $resized = imagecreatetruecolor($resizedWidth, $resizedHeight);
        if ($resized === false) {
            throw new RuntimeException('Could not create resized image.');
        }

        imagecopyresampled($resized, $image, 0, 0, 0, 0, $resizedWidth, $resizedHeight, $width, $height);
        imagedestroy($image);

        $cropX = max((int) floor(($resizedWidth - $resolution) / 2), 0);
        $cropY = max((int) floor(($resizedHeight - $resolution) / 2), 0);
        $cropped = imagecrop($resized, [
            'x' => $cropX,
            'y' => $cropY,
            'width' => $resolution,
            'height' => $resolution,
        ]);
        imagedestroy($resized);

        if (! $cropped instanceof GdImage) {
            throw new RuntimeException('Could not center crop image.');
        }

        return $cropped;
    }

    private function imageFromBytes(string $bytes): GdImage
    {
        $image = @imagecreatefromstring($bytes);

        if (! $image instanceof GdImage) {
            throw new RuntimeException('Could not decode image bytes.');
        }

        return $image;
    }

    private function encodeImage(GdImage $image, string $format, int $quality): string
    {
        ob_start();
        $ok = match ($format) {
            'jpeg' => imagejpeg($image, null, $quality),
            'webp' => imagewebp($image, null, $quality),
            default => false,
        };
        $bytes = ob_get_clean();

        if (! $ok || ! is_string($bytes)) {
            throw new RuntimeException("Could not encode {$format} baseline.");
        }

        return $bytes;
    }

    private function rgbAt(GdImage $image, int $x, int $y): array
    {
        $value = imagecolorat($image, $x, $y);

        return [
            ($value >> 16) & 0xFF,
            ($value >> 8) & 0xFF,
            $value & 0xFF,
        ];
    }

    private function heatColor(float $value): array
    {
        $value = max(min($value, 1), 0);

        if ($value < 0.25) {
            $t = $value / 0.25;
            return [0, (int) round(120 * $t), 255];
        }

        if ($value < 0.5) {
            $t = ($value - 0.25) / 0.25;
            return [0, 120 + (int) round(135 * $t), 255 - (int) round(255 * $t)];
        }

        if ($value < 0.75) {
            $t = ($value - 0.5) / 0.25;
            return [(int) round(255 * $t), 255, 0];
        }

        $t = ($value - 0.75) / 0.25;
        return [255, 255 - (int) round(255 * $t), 0];
    }
}
