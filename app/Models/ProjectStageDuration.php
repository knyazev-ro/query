<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectStageDuration extends Model
{
    protected $fillable = [
        'project_id',
        'stage_id',
        'stayed_from',
        'stayed_to',
        'duration', // in ms
    ];

    protected $casts = [
    'stayed_from' => 'datetime',
    'stayed_to' => 'datetime',   
    ];

    public function stage() {
        return $this->belongsTo(Stage::class, 'stage_id');
    }

    protected static function booted() {
        static::creating(function (ProjectStageDuration $projectStageDuration) {
            $projectStageDuration->duration = $projectStageDuration->stayed_to->diffInMilliseconds(date: $projectStageDuration->stayed_from, absolute:true);
        });
    }
}
