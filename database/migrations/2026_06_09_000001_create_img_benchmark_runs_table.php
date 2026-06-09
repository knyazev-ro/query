<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('img_benchmark_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('img_benchmark_id')->constrained('img_benchmarks')->cascadeOnDelete();
            $table->foreignId('model_version_id')->nullable()->constrained('model_versions')->nullOnDelete();
            $table->unsignedSmallInteger('position');
            $table->string('status')->default('pending');
            $table->jsonb('summary')->nullable();
            $table->text('errors')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->unique(['img_benchmark_id', 'position']);
            $table->unique(['img_benchmark_id', 'model_version_id']);
            $table->index(['img_benchmark_id', 'status']);
        });

        DB::table('img_benchmarks')
            ->whereNotNull('model_version_id')
            ->orderBy('id')
            ->each(function (object $benchmark): void {
                $runId = DB::table('img_benchmark_runs')->insertGetId([
                    'img_benchmark_id' => $benchmark->id,
                    'model_version_id' => $benchmark->model_version_id,
                    'position' => 1,
                    'status' => $benchmark->status,
                    'summary' => $benchmark->summary,
                    'errors' => $benchmark->errors,
                    'started_at' => $benchmark->created_at,
                    'finished_at' => in_array($benchmark->status, ['ready', 'error', 'cancel'], true)
                        ? $benchmark->updated_at
                        : null,
                    'created_at' => $benchmark->created_at,
                    'updated_at' => $benchmark->updated_at,
                ]);

                DB::table('img_media')
                    ->where('entity_type', 'App\\Models\\ImgBenchmark')
                    ->where('entity_id', $benchmark->id)
                    ->update([
                        'entity_type' => 'App\\Models\\ImgBenchmarkRun',
                        'entity_id' => $runId,
                    ]);
            });
    }

    public function down(): void
    {
        DB::table('img_benchmark_runs')
            ->orderBy('id')
            ->each(function (object $run): void {
                DB::table('img_media')
                    ->where('entity_type', 'App\\Models\\ImgBenchmarkRun')
                    ->where('entity_id', $run->id)
                    ->update([
                        'entity_type' => 'App\\Models\\ImgBenchmark',
                        'entity_id' => $run->img_benchmark_id,
                    ]);
            });

        Schema::dropIfExists('img_benchmark_runs');
    }
};
