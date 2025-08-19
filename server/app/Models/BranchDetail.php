<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BranchDetail extends Model
{
    public $timestamps = false;

    protected $primaryKey = "bdetails_id";

    protected $guarded = [];

    public function branch()
    {
        return $this->belongsTo(BranchList::class, 'blist_id', 'blist_id');
    }
}
