<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('display_name');
            $table->string('avatar_url')->nullable();
            $table->json('settings')->nullable();
            $table->enum('status', ['online', 'away', 'busy', 'offline'])->default('offline');
            $table->integer('max_conversations')->default(5);
            $table->timestamps();

            $table->unique(['tenant_id', 'user_id']);
        });

        Schema::create('agent_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();
            $table->string('skill');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_skills');
        Schema::dropIfExists('agents');
    }
};
