<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SallaIntegration extends Model
{
    protected $fillable = [
        'tenant_id',
        'salla_store_id',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'store_data',
        'is_connected',
    ];

    protected function casts(): array
    {
        return [
            'token_expires_at' => 'datetime',
            'store_data' => 'json',
            'is_connected' => 'boolean',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isTokenExpired(): bool
    {
        return $this->token_expires_at && $this->token_expires_at->isPast();
    }
}
