<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = [
        'tenant_id',
        'user_id',
        'display_name',
        'avatar_url',
        'settings',
        'status',
        'max_conversations',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'json',
            'max_conversations' => 'integer',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'assigned_agent_id');
    }

    public function skills()
    {
        return $this->hasMany(AgentSkill::class);
    }

    public function isOnline(): bool
    {
        return $this->status === 'online';
    }
}
