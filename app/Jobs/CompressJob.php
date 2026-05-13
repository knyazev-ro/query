<?php

namespace App\Jobs;

use App\Models\ImgMedia;
use App\Models\ModelVersion;
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

    public function handle(MLConnector $mlConnector): void
    {
        $modelVersion = ModelVersion::find($this->modelVersionId);

        if ($modelVersion === null || $modelVersion->status !== 'ready') {
            return;
        }

        $imgMedia = ImgMedia::query()
            ->whereIn('id', $this->imgMediaIds)
            ->where('status', 'just created')
            ->get();

        if ($imgMedia->isEmpty()) {
            return;
        }

        $mlConnector->compress($modelVersion, $imgMedia);
    }
}
