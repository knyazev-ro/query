<?php

namespace App\Http\Controllers;

use App\Models\MLAuditEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MLAuditController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'severity' => 'nullable|string|in:info,warning,error',
            'event_type' => 'nullable|string|max:255',
            'model_version_id' => 'nullable|integer',
            'img_media_id' => 'nullable|integer',
        ]);

        $events = MLAuditEvent::query()
            ->with(['modelVersion.model', 'imgMedia'])
            ->when($filters['severity'] ?? null, fn ($query, $severity) => $query->where('severity', $severity))
            ->when($filters['event_type'] ?? null, fn ($query, $eventType) => $query->where('event_type', $eventType))
            ->when($filters['model_version_id'] ?? null, fn ($query, $id) => $query->where('model_version_id', $id))
            ->when($filters['img_media_id'] ?? null, fn ($query, $id) => $query->where('img_media_id', $id))
            ->latest('occurred_at')
            ->paginate(30)
            ->withQueryString();

        $eventTypes = MLAuditEvent::query()
            ->select('event_type')
            ->distinct()
            ->orderBy('event_type')
            ->pluck('event_type')
            ->values();

        return Inertia::render('MLAudit/Main', [
            'events' => $events,
            'filters' => $filters,
            'eventTypes' => $eventTypes,
        ]);
    }
}
