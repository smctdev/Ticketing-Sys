<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketCategory extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'ticket_category_id';

    protected $guarded = [];

    public function categoryGroup()
    {
        return $this->belongsTo(GroupCategory::class, 'group_code', 'id');
    }
}
