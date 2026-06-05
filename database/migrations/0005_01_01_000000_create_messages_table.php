<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('agents')->nullOnDelete();
            $table->enum('direction', ['incoming', 'outgoing']);
            $table->enum('channel', ['widget', 'whatsapp', 'salla'])->default('widget');
            $table->enum('type', ['text', 'image', 'file', 'system'])->default('text');
            $table->text('body');
            $table->json('metadata')->nullable();
            $table->string('whatsapp_message_id')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'created_at']);
            $table->index(['contact_id']);
            $table->index(['agent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
