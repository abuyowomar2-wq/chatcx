<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WidgetSetting extends Model
{
    protected $fillable = [
        'tenant_id',
        'primary_color',
        'secondary_color',
        'position',
        'title',
        'subtitle',
        'welcome_message',
        'offline_message',
        'agent_avatar',
        'logo_url',
        'show_agent_info',
        'is_active',
        'extra_settings',
    ];

    protected function casts(): array
    {
        return [
            'show_agent_info' => 'boolean',
            'is_active' => 'boolean',
            'extra_settings' => 'json',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
