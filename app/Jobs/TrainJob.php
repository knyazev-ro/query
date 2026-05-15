<?php

namespace App\Jobs;

use App\Models\ModelVersion;
use App\Services\MLAuditLogger;
use App\Services\MLConnector;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class TrainJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public function __construct(
        public int $modelVersionId,
    ) {
        //
    }

    public function handle(MLConnector $mlConnector, MLAuditLogger $auditLogger): void
    {
        $modelVersion = ModelVersion::find($this->modelVersionId);

        if ($modelVersion === null || $modelVersion->status !== 'queue') {
            $auditLogger->warning('train_job_skipped', [
                'model_version_id' => $this->modelVersionId,
                'message' => 'Train job skipped because version is missing or no longer queued.',
                'context' => [
                    'status' => $modelVersion?->status,
                ],
            ]);
            return;
        }

        $auditLogger->info('train_job_started', [
            'model_version' => $modelVersion,
            'message' => "Train job started for version v{$modelVersion->version_number}.",
        ]);

        $mlConnector->train($modelVersion);
    }
}
