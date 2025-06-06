<?php

namespace App\Models;

use App\Enums\UserRoles;
use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    protected $primaryKey = 'user_role_id';

    public $timestamps = false;

    protected $guarded = [];

    protected function casts()
    {
        return [
            'role_name' => UserRoles::class,
        ];
    }
}
