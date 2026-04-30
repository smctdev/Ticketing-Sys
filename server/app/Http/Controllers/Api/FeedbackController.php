<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $feedbacks = Feedback::with([
            'user.userDetail',
            'user.userRole',
        ])
            ->latest()
            ->simplePaginate(10)
            ->through(fn($feedback) => [
                'id'          => $feedback->id,
                'rating'      => $feedback->rating,
                'comment'     => $feedback->comment,
                'created_at'  => $feedback->created_at,
                'user_name'   => $feedback->is_anonymous ? 'Anonymous' : $feedback->user?->full_name,
                'profile_pic' => $feedback->is_anonymous ? null : $feedback->user?->userDetail?->profile_pic,
                'role_name'   => $feedback->is_anonymous ? 'Anonymous' : $feedback->user?->userRole->role_name,
            ]);

        return response()->json([
            'data' => $feedbacks
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'is_anonymous' => ['required', 'boolean'],
            'rating'       => ['required', 'integer', 'between:1,5'],
            'comment'      => ['required', 'string', 'min:2', 'max:10000'],
        ]);

        $feedback = Feedback::query()->create([
            'user_id'      => Auth::id(),
            'is_anonymous' => $request->is_anonymous,
            'rating'       => $request->rating,
            'comment'      => $request->comment,
        ]);

        return response()->json([
            'message'         => 'Feedback created successfully',
            'data'            => [
                'id'          => $feedback->id,
                'rating'      => $feedback->rating,
                'comment'     => $feedback->comment,
                'created_at'  => $feedback->created_at,
                'user_name'   => $feedback->is_anonymous ? 'Anonymous' : $feedback->user?->full_name,
                'profile_pic' => $feedback->is_anonymous ? null : $feedback->user?->userDetail?->profile_pic,
                'role_name'   => $feedback->is_anonymous ? 'Anonymous' : $feedback->user?->userRole->role_name,
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
}
