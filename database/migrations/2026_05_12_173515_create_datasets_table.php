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
        Schema::create('datasets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('original_filename')->nullable();
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('mime_type')->nullable();
            $table->unsignedSmallInteger('rotation_degree')->default(0);
            $table->boolean('do_flip')->default(false);
            $table->unsignedSmallInteger('image_resolution')->default(256);
            $table->unsignedTinyInteger('train_split')->default(80);
            $table->unsignedTinyInteger('test_split')->default(20);
            $table->unsignedInteger('images_count')->default(0);
            $table->unsignedInteger('uses_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('datasets');
    }
};
