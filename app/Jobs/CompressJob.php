<?php

namespace App\Jobs;

use App\Models\ImgMedia;
use App\Models\ModelVersion;
use App\Services\MLAuditLogger;
use App\Services\MLConnector;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CompressJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    /**
     * @param array<int> $imgMediaIds
     */
    public function __construct(
        public int $modelVersionId,
        public array $imgMediaIds,
    ) {
        $this->imgMediaIds = array_values(array_unique($this->imgMediaIds));
    }

    public function handle(MLConnector $mlConnector, MLAuditLogger $auditLogger): void
    {
        $modelVersion = ModelVersion::find($this->modelVersionId);

        if ($modelVersion === null || $modelVersion->status !== 'ready') {
            $auditLogger->warning('compression_job_skipped', [
                'model_version_id' => $this->modelVersionId,
                'message' => 'Compression job skipped because model version is missing or not ready.',
                'context' => [
                    'image_ids' => $this->imgMediaIds,
                    'status' => $modelVersion?->status,
                ],
            ]);
            return;
        }

        $imgMedia = ImgMedia::query()
            ->whereIn('id', $this->imgMediaIds)
            ->where('model_version_id', $modelVersion->id)
            ->where('status', 'just created')
            ->get();

        if ($imgMedia->isEmpty()) {
            $auditLogger->warning('compression_job_empty', [
                'model_version' => $modelVersion,
                'message' => 'Compression job found no queued images.',
                'context' => [
                    'image_ids' => $this->imgMediaIds,
                ],
            ]);
            return;
        }

        $auditLogger->info('compression_job_started', [
            'model_version' => $modelVersion,
            'message' => "Compression job started for {$imgMedia->count()} images.",
            'context' => [
                'image_ids' => $imgMedia->pluck('id')->all(),
            ],
        ]);

        $mlConnector->compress($modelVersion, $imgMedia);
    }
}
