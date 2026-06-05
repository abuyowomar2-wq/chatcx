<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        \App\Events\NewMessage::class => [
            \App\Listeners\SendMessageNotification::class,
        ],
        \App\Events\ConversationAssigned::class => [
            \App\Listeners\NotifyAgentAssignment::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
