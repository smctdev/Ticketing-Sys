<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(UserLogin::class, 'user_id', 'login_id');
    }
}
