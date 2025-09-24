<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::query()
            ->with('comments.user', 'user.userDetail', 'userLikes')
            ->orderByDesc('created_at')
            ->cursorPaginate(10);

        return response()->json([
            'message'           => 'Posts fetched successfully',
            'data'              => $posts
        ], 200);
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
    public function store(StorePostRequest $request)
    {
        $request->validated();

        $post = Post::query()
            ->create([
                'category'          => $request->category,
                'content'           => $request->content,
                'user_id'           => Auth::id()
            ]);

        return response()->json([
            'message'           => "Post \"{$post->category}\" created successfully",
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
    public function update(UpdatePostRequest $request, string $id)
    {
        $request->validated();

        $post = Post::findOrFail($id);

        $post->update([
            'category'          => $request->category,
            'content'           => $request->content
        ]);

        return response()->json([
            'message'           => "Post \"{$post->category}\" updated successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $post = Post::findOrFail($id);

        $post->delete();

        return response()->json([
            'message'           => "Post \"{$post->category}\" deleted successfully",
        ], 200);
    }
}
