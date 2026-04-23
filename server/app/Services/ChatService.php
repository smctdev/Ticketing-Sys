<?php

namespace App\Services;

use App\Models\Message;
use App\Models\UserLogin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ChatService
{
    public function getConversations($search, $limit)
    {
        return UserLogin::query()
            ->with('userDetail')
            ->withMax('sentMessages as sent_message_latest', 'created_at')
            ->withMax('receivedMessages as received_message_latest', 'created_at')
            ->with('sentMessages', 'receivedMessages')
            ->search($search)
            ->when(!$search, function ($q) {
                $q->where(function ($sQ) {
                    $sQ->has('sentMessages')
                        ->orHas('receivedMessages');
                });
            })
            ->orderByRaw('GREATEST(COALESCE(sent_message_latest, 0), COALESCE(received_message_latest, 0)) DESC')
            ->paginate($limit)
            ->through(function ($user) {
                $attachment_count = collect([$user->sentMessages->last(), $user->receivedMessages->last()])->max()?->attachments()?->count();
                $last_message_by_attachment = $attachment_count > 0 ? "Sent {$attachment_count} " . Str::plural('attachment', $attachment_count) : "";

                return [
                    'login_id'     => $user->login_id,
                    'full_name'    => $user->full_name,
                    'profile_pic'  => $user->userDetail->profile_pic,
                    'timestamp'    => collect([$user->sent_message_latest, $user->received_message_latest])->max(),
                    'last_message' => collect([$user->sentMessages->last(), $user->receivedMessages->last()])->max()?->body ?: $last_message_by_attachment,
                ];
            });
    }
    public function getMessages($chat)
    {
        $messages = Message::query()
            ->with('attachments:id,message_id,path', 'replyFrom:id,body')
            ->where(function ($query) use ($chat) {
                $query->where('sender_id', Auth::id())
                    ->where('receiver_id', $chat->login_id);
            })
            ->orWhere(function ($query) use ($chat) {
                $query->where('sender_id', $chat->login_id)
                    ->where('receiver_id', Auth::id());
            })
            ->latest()
            ->simplePaginate(50);

        return [
            'data'            => $messages,
            'user'            => [
                'full_name'   => $chat->full_name,
                'profile_pic' => $chat->userDetail->profile_pic
            ],
        ];
    }

    public function sendMessage($request)
    {
        $message = Message::query()->create([
            'sender_id'    => Auth::id(),
            'receiver_id'  => $request->receiver_id,
            'body'         => $request->body,
            'parent_id'    => $request->message_id
        ]);

        $attachments = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->attachments as $attachment) {
                $name = time() . "-" . $attachment->getClientOriginalName();

                $attachments[] = [
                    'path' => $attachment->storeAs('message_attachments', $name, 'public'),
                ];
            }
        }

        $message->attachments()->createMany($attachments);

        return $message->load('attachments:id,message_id,path', 'replyFrom:id,body');
    }

    public function updateMessage($request, $chat)
    {
        $chat->update([
            'body' => $request->body
        ]);

        return $chat->load('attachments:id,message_id,path', 'replyFrom:id,body');
    }
}
