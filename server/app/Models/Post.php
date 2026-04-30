<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Post extends Model
{
    protected $guarded = [];

    protected $appends = [
        'is_edited'
    ];

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

    public function toggleLikeUnlike($userId)
    {
        if ($this->userLikes()->where('user_id', $userId)->exists()) {

            $this->userLikes()->detach($userId);

            return "unliked";
        }

        $this->userLikes()->attach($userId);

        return "liked";
    }

    public function getIsEditedAttribute()
    {
        return Carbon::parse($this->updated_at)->gt(Carbon::parse($this->created_at));
    }
}
