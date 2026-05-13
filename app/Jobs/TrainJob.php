<?php

namespace App\Jobs;

use App\Models\ModelVersion;
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

    public function handle(MLConnector $mlConnector): void
    {
        $modelVersion = ModelVersion::find($this->modelVersionId);

        if ($modelVersion === null || $modelVersion->status !== 'queue') {
            return;
        }

        $mlConnector->train($modelVersion);
    }
}
