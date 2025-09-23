<?php

namespace App\Notifications;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketNotification extends Notification implements ShouldQueue, ShouldBroadcast
{
    use Queueable;

    /**
     * Create a new notification instance.
     */

    public function __construct(
        protected string $message,
        protected string $ticket_code,
        protected string | null $user_profile,
        protected string $full_name,
        public int $login_id
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message'                       => $this->message,
            'profile'                       => $this->user_profile,
            'full_name'                     => $this->full_name,
            'ticket_code'                   => $this->ticket_code,
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage(
            [
                'id'                                => $this->id,
                'type'                              => static::class,
                'notifiable_type'                   => get_class($notifiable),
                'notifiable_id'                     => $notifiable->id,
                'data'                              =>
                [
                    'message'                       => $this->message,
                    'profile'                       => $this->user_profile,
                    'full_name'                     => $this->full_name,
                    'ticket_code'                   => $this->ticket_code,
                ],
                'read_at'                           => null,
                'created_at'                        => now(),
                'updated_at'                        => now(),
                'unread_notification_count'         => $notifiable->unreadNotifications()->count(),
            ]
        );
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel("App.Models.UserLogin.{$this->login_id}"),
            new PrivateChannel("approver-of-ticket-{$this->login_id}"),
        ];
    }
}
