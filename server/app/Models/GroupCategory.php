<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupCategory extends Model
{
    public $timestamps = false;

    protected $guarded = [];

    public function ticketCategories()
    {
        return $this->hasMany(TicketCategory::class, 'group_code', 'id');
    }

    public function groupCategoryAssignedAccounting()
    {
        return $this->belongsToMany(UserLogin::class, 'assigned_categories', 'group_code', 'login_id');
    }
}
