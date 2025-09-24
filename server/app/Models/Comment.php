<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(UserLogin::class, 'user_id', 'login_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
