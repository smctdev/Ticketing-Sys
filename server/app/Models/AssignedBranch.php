<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignedBranch extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function branch()
    {
        return $this->belongsTo(BranchList::class, 'blist_id', 'blist_id');
    }

    public function assignedAutomation()
    {
        return $this->belongsTo(UserLogin::class, 'login_id', 'login_id');
    }
}
