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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description');
            $table->foreignId('author_id')->constrained('users');
            $table->foreignId('stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->timestamp('stage_changed_at')->nullable();
            $table->unsignedTinyInteger('level')->default(0);
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->bigInteger('amount')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
