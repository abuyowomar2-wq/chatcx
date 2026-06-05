<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationParticipant extends Model
{
    protected $fillable = ['conversation_id', 'agent_id', 'type'];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
