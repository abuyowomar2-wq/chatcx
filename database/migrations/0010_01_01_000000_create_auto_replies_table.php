<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auto_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('trigger_type', ['keyword', 'off_hours', 'welcome'])->default('keyword');
            $table->json('keywords')->nullable();
            $table->text('response_message');
            $table->boolean('is_active')->default(true);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->json('schedule_days')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'trigger_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auto_replies');
    }
};
