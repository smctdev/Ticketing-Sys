<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginCode extends Model
{
    protected $guarded = [];

    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class, 'user_details_id');
    }
}
