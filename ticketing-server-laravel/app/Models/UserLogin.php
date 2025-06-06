<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class UserLogin extends Authenticatable
{
    use HasApiTokens;

    protected $primaryKey = 'login_id';

    public $timestamps = false;

    protected $guarded = [];

    protected $hidden = [
        'password'
    ];

    protected $appends = [
        "full_name"
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed'
        ];
    }

    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class, 'user_details_id');
    }

    public function userRole()
    {
        return $this->belongsTo(UserRole::class, 'user_role_id');
    }

    public function branch()
    {
        return $this->belongsTo(BranchList::class, 'blist_id');
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class, 'login_id', 'login_id');
    }

    public function editedByAutomationTickets()
    {
        return $this->hasMany(Ticket::class, 'edited_by', 'login_id');
    }

    public function getFullNameAttribute()
    {
        return "{$this->userDetail->fname} {$this->userDetail->lname}";
    }

    public function assignedBranches()
    {
        return $this->hasMany(AssignedBranch::class, "login_id", "login_id");
    }

    public function assignedCategories()
    {
        return $this->hasMany(AssignedCategory::class, "login_id", "login_id");
    }

    public function assignedBranchCas()
    {
        return $this->hasMany(AssignedBranchCas::class, "login_id", "login_id");
    }

    public function assignedAreaManagers()
    {
        return $this->hasMany(AssignedAreaManager::class, "login_id", "login_id");
    }
}
