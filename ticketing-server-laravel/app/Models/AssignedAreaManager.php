<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignedAreaManager extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function branch()
    {
        return $this->belongsTo(BranchList::class, 'blist_id', 'blist_id');
    }

    public function userLogin()
    {
        return $this->belongsTo(UserLogin::class, 'login_id', 'login_id');
    }
}
