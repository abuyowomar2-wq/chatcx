<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('phone_number_id');
            $table->string('business_account_id')->nullable();
            $table->text('access_token');
            $table->string('phone_number')->nullable();
            $table->json('webhook_config')->nullable();
            $table->boolean('is_connected')->default(false);
            $table->timestamp('webhook_verified_at')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'phone_number_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_integrations');
    }
};
