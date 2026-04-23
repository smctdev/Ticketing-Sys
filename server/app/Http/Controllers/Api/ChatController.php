<?php

namespace App\Http\Controllers\Api;

use App\Events\ChatEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
use App\Models\UserLogin;
use App\Services\ChatService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function __construct(public ChatService $chat) {}

    public function index()
    {
        $limit = request('limit');
        $search = request('search');

        $conversations = $this->chat->getConversations($search, $limit);

        return response()->json([
            "message" => "Conversations fetched successfully",
            "data"    => $conversations
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMessageRequest $request)
    {
        $request->validated();

        $message = $this->chat->sendMessage($request);

        ChatEvent::dispatch($message->receiver_id, $message, 'created');

        $this->flushUnseenMessage($message->receiver_id);

        return response()->json([
            'message' => 'Message Sent Successfully',
            'data'    => $message
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserLogin $chat)
    {
        $messages = $this->chat->getMessages($chat);

        return response()->json([
            'message' => 'Messages Fetched Successfully',
            'data'    => $messages
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreMessageRequest $request, Message $chat)
    {
        $request->validated();

        $message = $this->chat->updateMessage($request, $chat);

        ChatEvent::dispatch($message?->receiver_id, $message, 'updated');

        $this->flushUnseenMessage($message?->receiver_id);

        return response()->json([
            'message' => 'Message Updated Successfully',
            'data'    => $message
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $chat)
    {
        $item = (object) [
            'id'          => $chat->id,
            'receiver_id' => $chat->receiver_id,
            'sender_id'   => $chat->sender_id
        ];

        if ($chat->attachments) {
            foreach ($chat->attachments as $attachment) {
                Storage::disk('public')->delete($attachment->path);
            }
        }

        $chat->delete();

        ChatEvent::dispatch($item?->receiver_id, $item, 'deleted');

        return response()->json([
            'message' => 'Message Deleted Successfully',
            'data'    => $chat
        ], 200);
    }

    public function flushUnseenMessage(int $user)
    {
        Auth::user()->unreadMessages()->where('login_id', $user)->delete();

        return response()->noContent();
    }
}
