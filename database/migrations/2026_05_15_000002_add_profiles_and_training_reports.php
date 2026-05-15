<?php

use App\Models\Dataset;
use App\Services\FileService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('datasets', function (Blueprint $table) {
            $table->jsonb('profile')->nullable()->after('uses_count');
        });

        Schema::table('model_versions', function (Blueprint $table) {
            $table->timestamp('training_started_at')->nullable()->after('quality_metrics');
            $table->timestamp('training_finished_at')->nullable()->after('training_started_at');
            $table->jsonb('training_report')->nullable()->after('training_finished_at');
        });

        $this->backfillDatasetProfiles();
    }

    public function down(): void
    {
        Schema::table('model_versions', function (Blueprint $table) {
            $table->dropColumn([
                'training_started_at',
                'training_finished_at',
                'training_report',
            ]);
        });

        Schema::table('datasets', function (Blueprint $table) {
            $table->dropColumn('profile');
        });
    }

    private function backfillDatasetProfiles(): void
    {
        $inspector = app(FileService::class);

        Dataset::query()
            ->whereNull('profile')
            ->orderBy('id')
            ->each(function (Dataset $dataset) use ($inspector): void {
                try {
                    $profile = $inspector->inspectDatasetArchive($dataset->file_path);

                    $dataset->forceFill([
                        'profile' => $profile,
                        'images_count' => $profile['images_count'],
                    ])->save();
                } catch (\Throwable) {
                    // Missing legacy archive files should not block schema migration.
                }
            });
    }
};
