<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignedCategory extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function userLogin()
    {
        return $this->belongsTo(UserLogin::class, 'login_id', 'login_id');
    }
    public function categoryGroup()
    {
        return $this->belongsTo(GroupCategory::class, 'login_id', 'id');
    }

    public function categoryGroupCode()
    {
        return $this->belongsTo(GroupCategory::class, 'group_code', 'id');
    }
}
