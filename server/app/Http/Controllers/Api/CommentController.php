<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Requests\UpdateCommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCommentRequest $request)
    {
        $request->validated();

        Comment::query()
            ->create([
                'post_id'           => $request->post_id,
                'content'           => $request->content,
                'user_id'           => Auth::id()
            ]);

        return response()->json([
            'message'           => "Comment posted successfully",
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
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCommentRequest $request, string $id)
    {
        $request->validated();

        $comment = Comment::findOrFail($id);

        $comment->update([
            'content'           => $request->content,
        ]);

        return response()->json([
            'message'           => "Comment updated successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $comment = Comment::findOrFail($id);

        $comment->delete();

        return response()->json([
            'message'           => "Comment deleted successfully",
        ], 200);
    }
}
