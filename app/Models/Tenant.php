<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'store_name',
        'email',
        'phone',
        'domain',
        'plan',
        'is_active',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'json',
        ];
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function agents()
    {
        return $this->hasMany(Agent::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function sallaIntegration()
    {
        return $this->hasOne(SallaIntegration::class);
    }

    public function whatsappIntegration()
    {
        return $this->hasOne(WhatsAppIntegration::class);
    }

    public function widgetSettings()
    {
        return $this->hasOne(WidgetSetting::class);
    }

    public function quickReplies()
    {
        return $this->hasMany(QuickReply::class);
    }

    public function autoReplies()
    {
        return $this->hasMany(AutoReply::class);
    }
}
