<?php

namespace App\Listeners;

use App\Events\ChatEvent;
use App\Models\UserUnreadMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;

class UserUnreadMessageListener
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ChatEvent $event): void
    {
        if ($event->type !== 'created') return;

        UserUnreadMessage::firstOrCreate([
            'user_id'  => $event->receiver_id,
            'login_id' => Auth::id()
        ])->increment('total');
    }
}
