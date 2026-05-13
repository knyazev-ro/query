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
        Schema::create('img_media', function (Blueprint $table) {
            $table->id();

            $table->string('img_path')->nullable();
            $table->string('compressed_img_path')->nullable();

            $table->string('original_name');
            $table->string('mime_type');

            $table->unsignedBigInteger('original_size');
            $table->unsignedBigInteger('compressed_size')->nullable();

            $table->foreignId('author_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // polymorphic relation
            // либо так короче:
            $table->nullableMorphs('entity');

            $table->timestamps();

            $table->index(['entity_id', 'entity_type']);

            $table->string('status')->default('just created'); // "just created" "compressing" "compressed" "error" "cancel"
            $table->text('errors');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('img_media');
    }
};