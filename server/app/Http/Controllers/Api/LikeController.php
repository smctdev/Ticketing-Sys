<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function __invoke(string $id)
    {
        $post = Post::findOrFail($id);

        $message = $post->toggleLikeUnlike(Auth::id());

        return response()->json([
            'message' => "Post {$message} successfully",
        ], 201);
    }
}
