<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'conversation_id',
        'contact_id',
        'agent_id',
        'direction',
        'channel',
        'type',
        'body',
        'metadata',
        'whatsapp_message_id',
        'is_read',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'json',
            'is_read' => 'boolean',
            'read_at' => 'datetime',
        ];
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}
