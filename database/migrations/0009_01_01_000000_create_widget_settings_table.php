<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('primary_color')->default('#0ea5e9');
            $table->string('secondary_color')->default('#ffffff');
            $table->string('position')->default('bottom-right');
            $table->string('title')->default('تحدث معنا');
            $table->string('subtitle')->default('نحن هنا لمساعدتك');
            $table->text('welcome_message')->default('مرحباً! كيف يمكننا مساعدتك اليوم؟');
            $table->string('offline_message')->default('نعتذر، خارج أوقات العمل. سنرد عليك في أقرب وقت.');
            $table->string('agent_avatar')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('show_agent_info')->default(true);
            $table->boolean('is_active')->default(true);
            $table->json('extra_settings')->nullable();
            $table->timestamps();

            $table->unique('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_settings');
    }
};
