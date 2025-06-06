<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignedBranchCas extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function userLogin()
    {
        return $this->belongsTo(UserLogin::class, 'login_id', 'login_id');
    }
    public function branch()
    {
        return $this->belongsTo(BranchList::class, 'blist_id', 'blist_id');
    }
}
