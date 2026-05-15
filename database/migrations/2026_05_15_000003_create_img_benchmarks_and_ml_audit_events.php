<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('img_benchmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('model_version_id')->nullable()->constrained('model_versions')->nullOnDelete();
            $table->string('name');
            $table->string('status')->default('queue');
            $table->jsonb('summary')->nullable();
            $table->text('errors')->nullable();
            $table->timestamps();

            $table->index(['author_id', 'status']);
            $table->index(['model_version_id', 'status']);
        });

        Schema::create('ml_audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('model_version_id')->nullable()->constrained('model_versions')->nullOnDelete();
            $table->foreignId('img_media_id')->nullable()->constrained('img_media')->nullOnDelete();
            $table->string('event_type');
            $table->string('severity')->default('info');
            $table->nullableMorphs('entity');
            $table->string('status')->nullable();
            $table->string('job_id')->nullable();
            $table->text('message')->nullable();
            $table->jsonb('context')->nullable();
            $table->timestamp('occurred_at')->useCurrent();
            $table->timestamps();

            $table->index(['event_type', 'occurred_at']);
            $table->index(['severity', 'occurred_at']);
            $table->index(['model_version_id', 'occurred_at']);
            $table->index(['img_media_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ml_audit_events');
        Schema::dropIfExists('img_benchmarks');
    }
};
