<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('version_datasets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('model_version_id')->constrained('model_versions')->cascadeOnDelete();
            $table->foreignId('dataset_id')->constrained('datasets')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['model_version_id', 'dataset_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('version_datasets');
    }
};
