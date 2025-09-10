<?php

namespace App\Models;

use App\Enums\UserRoles;
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

    public function isAdmin()
    {
        return $this->userRole->role_name === UserRoles::ADMIN;
    }

    public function isAutomation()
    {
        return $this->userRole->role_name === UserRoles::AUTOMATION;
    }

    public function isAutomationManager()
    {
        return $this->userRole->role_name === UserRoles::AUTOMATION_MANAGER;
    }

    public function isAutomationAdmin()
    {
        return $this->userRole->role_name === UserRoles::AUTOMATION_ADMIN;
    }

    public function isAccountingHead()
    {
        return $this->userRole->role_name === UserRoles::ACCOUNTING_HEAD;
    }

    public function isBranchHead()
    {
        return $this->userRole->role_name === UserRoles::BRANCH_HEAD;
    }

    public function isStaff()
    {
        return $this->userRole->role_name === UserRoles::STAFF;
    }

    public function isAccountingStaff()
    {
        return $this->userRole->role_name === UserRoles::ACCOUNTING_STAFF;
    }

    public function isAreaManager()
    {
        return $this->userRole->role_name === UserRoles::AREA_MANAGER;
    }

    public function isCas()
    {
        return $this->userRole->role_name === UserRoles::CAS;
    }

    public function scopeSearch($query, $term)
    {
        $query->when(
            $term,
            fn($query)
            =>
            $query->where(
                fn($q)
                =>
                $q->where('username', 'LIKE', "%$term%")
                    ->orWhereHas(
                        'userDetail',
                        fn($sq)
                        =>
                        $sq->whereAny([
                            'fname',
                            'lname',
                            'user_contact',
                            'user_email'
                        ], 'LIKE', "%$term%")
                            ->orWhereRaw("CONCAT(fname, ' ', lname) LIKE ?", ["%$term%"])
                            ->orWhereRaw("CONCAT(lname, ' ', fname) LIKE ?", ["%$term%"])
                    )
                    ->orWhereHas(
                        'userRole',
                        fn($sq)
                        =>
                        $sq->where('role_name', 'LIKE', "%$term%")
                    )
                    ->orWhereHas(
                        'branch',
                        fn($sq)
                        =>
                        $sq->where('b_name', 'LIKE', "%$term%")
                            ->orWhere('b_code', 'LIKE', "%$term%")
                    )
                    ->orWhereHas(
                        'assignedBranches',
                        fn($aq)
                        =>
                        $aq->whereHas(
                            'branch',
                            fn($sq)
                            =>
                            $sq->where('b_name', 'LIKE', "%$term%")
                                ->orWhere('b_code', 'LIKE', "%$term%")
                        )
                    )
                    ->orWhereHas(
                        'assignedBranchCas',
                        fn($aq)
                        =>
                        $aq->whereHas(
                            'branch',
                            fn($sq)
                            =>
                            $sq->where('b_name', 'LIKE', "%$term%")
                                ->orWhere('b_code', 'LIKE', "%$term%")
                        )
                    )
                    ->orWhereHas(
                        'assignedAreaManagers',
                        fn($aq)
                        =>
                        $aq->whereHas(
                            'branch',
                            fn($sq)
                            =>
                            $sq->where('b_name', 'LIKE', "%$term%")
                                ->orWhere('b_code', 'LIKE', "%$term%")
                        )
                    )
                    ->orWhereHas(
                        'assignedCategories',
                        fn($aq)
                        =>
                        $aq->whereHas(
                            'categoryGroupCode',
                            fn($sq)
                            =>
                            $sq->where('group_code', 'LIKE', "%$term%")
                        )
                    )
            )
        );
    }
}
