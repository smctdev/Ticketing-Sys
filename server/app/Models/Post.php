<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(UserLogin::class, 'user_id', 'login_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function userLikes()
    {
        return $this->belongsToMany(UserLogin::class, 'likes', 'post_id', 'user_id');
    }
}
