<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salla_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('salla_store_id');
            $table->string('access_token');
            $table->string('refresh_token')->nullable();
            $table->timestamp('token_expires_at')->nullable();
            $table->json('store_data')->nullable();
            $table->boolean('is_connected')->default(false);
            $table->timestamps();

            $table->unique(['tenant_id', 'salla_store_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salla_integrations');
    }
};
