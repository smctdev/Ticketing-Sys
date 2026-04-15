<?php

namespace App\Http\Controllers\Api;

use App\Events\ChatEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\UserLogin;
use App\Models\UserUnreadMessage;
use App\Services\ChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

        ChatEvent::dispatch($message->receiver_id, $message);

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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function flushUnseenMessage(int $user)
    {
        Auth::user()->unreadMessages()->where('login_id', $user)->delete();

        return response()->noContent();
    }
}
