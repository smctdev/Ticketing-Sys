<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchList extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'blist_id';

    protected $guarded = [];

    public function branchDetail()
    {
        return $this->hasOne(BranchDetail::class, 'blist_id', 'blist_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'branch_id', 'blist_id');
    }

    public function editedTickets()
    {
        return $this->tickets()->where('status', 'EDITED');
    }

    public function assignedBranches()
    {
        return $this->hasMany(AssignedBranch::class, 'blist_id', 'blist_id');
    }

    public function assignedBranchCas()
    {
        return $this->hasMany(AssignedBranchCas::class, 'blist_id', 'blist_id');
    }

    public function assignedAreaManagers()
    {
        return $this->hasMany(AssignedAreaManager::class, 'blist_id', 'blist_id');
    }

    public function branchAssignedAutomations()
    {
        return $this->belongsToMany(UserLogin::class, 'assigned_branches', 'blist_id', 'login_id');
    }

    public function branchAssignedAreaManagers()
    {
        return $this->belongsToMany(UserLogin::class, 'assigned_area_managers', 'blist_id', 'login_id');
    }

    public function branchAssignedBranchCas()
    {
        return $this->belongsToMany(UserLogin::class, 'assigned_branch_cas', 'blist_id', 'login_id');
    }
}
