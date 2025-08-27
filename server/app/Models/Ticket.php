<?php

namespace App\Models;

use App\Enums\TicketStatus;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'ticket_id';

    protected $guarded = [];

    protected function casts()
    {
        return [
            'status' => TicketStatus::class,
        ];
    }

    public function userLogin()
    {
        return $this->belongsTo(UserLogin::class,  'login_id', 'login_id');
    }
    public function userDetail()
    {
        return $this->belongsTo(UserDetail::class, 'user_details_id');
    }

    public function ticketDetail()
    {
        return $this->belongsTo(TicketDetail::class, 'ticket_details_id', 'ticket_details_id');
    }

    public function branch()
    {
        return $this->belongsTo(BranchList::class, 'branch_id');
    }

    public function assignedPerson()
    {
        return $this->belongsTo(UserLogin::class, 'assigned_person', 'login_id');
    }

    public function editedBy()
    {
        return $this->belongsTo(UserLogin::class, 'edited_by', 'login_id');
    }

    public function approveHead()
    {
        return $this->belongsTo(UserLogin::class, 'approveHead', 'login_id');
    }
    public function approveAcctgStaff()
    {
        return $this->belongsTo(UserLogin::class, 'approveAcctgStaff', 'login_id');
    }
    public function approveAutm()
    {
        return $this->belongsTo(UserLogin::class, 'approveAutm', 'login_id');
    }
    public function approveAcctgSup()
    {
        return $this->belongsTo(UserLogin::class, 'approveAcctgSup', 'login_id');
    }

    public function assignedTicket()
    {
        return $this->belongsTo(UserLogin::class, 'assigned_person', 'login_id');
    }
}
