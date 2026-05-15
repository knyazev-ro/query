<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('model_versions', function (Blueprint $table) {
            $table->jsonb('quality_metrics')->nullable()->after('progress');
        });

        Schema::table('img_media', function (Blueprint $table) {
            $table->jsonb('quality_metrics')->nullable()->after('errors');
        });
    }

    public function down(): void
    {
        Schema::table('model_versions', function (Blueprint $table) {
            $table->dropColumn('quality_metrics');
        });

        Schema::table('img_media', function (Blueprint $table) {
            $table->dropColumn('quality_metrics');
        });
    }
};
