<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{

    public function __construct(protected $user = null)
    {
        $this->user = Auth::user();
    }
    public function markedAsRead($id)
    {

        $this->user->unreadNotifications->where('id', $id)->markAsRead();

        return response()->json([
            'message'   => "Successfully marked as read",
        ], 200);
    }

    public function markedAllAsRead()
    {
        $this->user->unreadNotifications->markAsRead();

        return response()->json([
            'message'   => "Successfully marked all as read",
        ], 200);
    }
}
