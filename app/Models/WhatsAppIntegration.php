<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppIntegration extends Model
{
    protected $fillable = [
        'tenant_id',
        'phone_number_id',
        'business_account_id',
        'access_token',
        'phone_number',
        'webhook_config',
        'is_connected',
        'webhook_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'webhook_config' => 'json',
            'is_connected' => 'boolean',
            'webhook_verified_at' => 'datetime',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
