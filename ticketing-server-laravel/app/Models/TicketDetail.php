<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketDetail extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'ticket_details_id';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'td_purpose'    => 'array',
            'td_from'       => 'array',
            'td_to'         => 'array',
            'td_support'    => 'array',
            'date_created'  => 'datetime',
        ];
    }

    protected $attributes = [
        'td_purpose' => '[]',
        'td_from'    => '[]',
        'td_to'      => '[]',
        'td_support' => '[]',
    ];

    public function ticketCategory()
    {
        return $this->belongsTo(TicketCategory::class, 'ticket_category_id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'suppliers', 'id');
    }
}
