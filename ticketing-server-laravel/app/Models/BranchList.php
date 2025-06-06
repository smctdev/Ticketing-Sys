<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchList extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'blist_id';

    protected $guarded = [];

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
}
