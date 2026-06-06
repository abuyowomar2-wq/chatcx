<?php

use App\Events\AgentTyping;
use App\Events\NewMessage;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{id}', function ($user, $id) {
    return true;
});

Broadcast::channel('tenant.{id}.conversations', function ($user, $id) {
    return true;
});

Broadcast::channel('tenant.{id}.agents', function ($user, $id) {
    return true;
});
