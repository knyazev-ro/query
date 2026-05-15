<?php

namespace App\Services;

use App\Models\ImgMedia;
use App\Models\MLAuditEvent;
use App\Models\ModelVersion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Throwable;

class MLAuditLogger
{
    public function info(string $eventType, array $attributes = []): void
    {
        $this->record($eventType, 'info', $attributes);
    }

    public function warning(string $eventType, array $attributes = []): void
    {
        $this->record($eventType, 'warning', $attributes);
    }

    public function error(string $eventType, array $attributes = []): void
    {
        $this->record($eventType, 'error', $attributes);
    }

    public function record(string $eventType, string $severity = 'info', array $attributes = []): void
    {
        try {
            $entity = $attributes['entity'] ?? null;
            $modelVersion = $attributes['model_version'] ?? null;
            $imgMedia = $attributes['img_media'] ?? null;

            MLAuditEvent::create([
                'author_id' => $attributes['author_id'] ?? Auth::id(),
                'model_version_id' => $attributes['model_version_id'] ?? $modelVersion?->id,
                'img_media_id' => $attributes['img_media_id'] ?? $imgMedia?->id,
                'event_type' => $eventType,
                'severity' => $severity,
                'entity_id' => $entity instanceof Model ? $entity->getKey() : ($attributes['entity_id'] ?? null),
                'entity_type' => $entity instanceof Model ? $entity::class : ($attributes['entity_type'] ?? null),
                'status' => $attributes['status'] ?? $this->statusFrom($modelVersion, $imgMedia),
                'job_id' => $attributes['job_id'] ?? null,
                'message' => $attributes['message'] ?? null,
                'context' => $attributes['context'] ?? null,
                'occurred_at' => $attributes['occurred_at'] ?? now(),
            ]);
        } catch (Throwable) {
            // Audit logging must never break the ML workflow.
        }
    }

    private function statusFrom(?ModelVersion $modelVersion, ?ImgMedia $imgMedia): ?string
    {
        return $imgMedia?->status ?? $modelVersion?->status;
    }
}
