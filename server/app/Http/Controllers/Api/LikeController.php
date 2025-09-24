<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function __invoke($id)
    {
        $post = Post::findOrFail($id);

        if ($post->userLikes->contains(Auth::id())) {

            $post->userLikes()->detach(Auth::id());

            return response()->json([
                'message'           => "Post unliked successfully",
            ], 201);
        }

        $post->userLikes()->attach(Auth::id());

        return response()->json([
            'message'           => "Post liked successfully",
        ], 201);
    }
}
