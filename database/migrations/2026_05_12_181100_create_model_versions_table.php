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
        Schema::create('model_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('img_compress_model_id')->constrained('img_compress_models')->cascadeOnDelete();
            $table->foreignId('parent_version_id')->nullable()->constrained('model_versions')->nullOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('version_number');
            $table->unsignedSmallInteger('image_resolution')->default(256);
            $table->string('status')->default('queue');
            $table->text('errors')->nullable();
            $table->timestamps();

            $table->unique(['img_compress_model_id', 'version_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('model_versions');
    }
};
