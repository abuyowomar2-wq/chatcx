<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class WidgetService
{
    public function generateEmbedCode(int $tenantId, array $settings = []): string
    {
        $settingsJson = json_encode([
            'tenant_id' => $tenantId,
            'primary_color' => $settings['primary_color'] ?? '#0ea5e9',
            'position' => $settings['position'] ?? 'bottom-right',
            'title' => $settings['title'] ?? 'تحدث معنا',
            'subtitle' => $settings['subtitle'] ?? 'نحن هنا لمساعدتك',
            'welcome_message' => $settings['welcome_message'] ?? 'مرحباً! كيف يمكننا مساعدتك اليوم؟',
            'api_url' => config('app.url') . '/api',
        ]);

        return <<<HTML
<!-- ChatCX Widget -->
<script>
(function() {
    var settings = {$settingsJson};
    var s = document.createElement('script');
    s.src = settings.api_url + '/widget/widget.js';
    s.async = true;
    s.onload = function() { ChatCXWidget.init(settings); };
    document.head.appendChild(s);
})();
</script>
<!-- End ChatCX Widget -->
HTML;
    }

    public function getWidgetJs(): string
    {
        $widgetPath = public_path('widget/widget.js');
        return File::exists($widgetPath) ? File::get($widgetPath) : '';
    }
}
