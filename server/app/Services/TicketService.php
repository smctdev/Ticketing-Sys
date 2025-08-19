<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketDetail;
use Illuminate\Support\Facades\Auth;

class TicketService
{
    public function __construct(protected $user = null)
    {
        $this->user = Auth::user();
    }

    public function getDashboardData()
    {
        return Ticket::with(
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'assignedTicket.userDetail',
            'assignedTicket.userRole',
            'assignedTicket.branch',
            'approveAcctgStaff',
            'approveHead',
            'approveAutm',
            'approveAcctgSup',
            'branch',
            'userLogin.userDetail'
        )
            ->where('login_id', $this->user->login_id)
            ->orderByDesc(
                TicketDetail::select('date_created')
                    ->whereColumn('tickets.ticket_details_id', 'ticket_details.ticket_details_id')
            )
            ->paginate(10);
    }

    public function getTotalTickets()
    {
        return Ticket::where('login_id', $this->user->login_id)
            ->count();
    }

    public function getTotalEditedTickets()
    {
        return Ticket::where([
            ['login_id', $this->user->login_id],
            ['status', TicketStatus::EDITED]
        ])
            ->count();
    }

    public function getTotalRejectedTickets()
    {
        return Ticket::where([
            ['login_id', $this->user->login_id],
            ['status', TicketStatus::REJECTED]
        ])
            ->count();
    }

    public function getTotalPendingTickets()
    {
        return Ticket::where([
            ['login_id', $this->user->login_id],
            ['status', TicketStatus::PENDING]
        ])
            ->count();
    }

    public function getRecentTickets()
    {
        return Ticket::with([
            'ticketDetail.ticketCategory:ticket_category_id,category_name',
            'ticketDetail:ticket_details_id,ticket_transaction_date,ticket_category_id'
        ])
            ->where([
                ['login_id', $this->user->login_id],
                ['status', TicketStatus::EDITED]
            ])
            ->orderByDesc(
                TicketDetail::select('ticket_transaction_date')
                    ->whereColumn(
                        'ticket_details.ticket_details_id',
                        'tickets.ticket_details_id'
                    )
            )
            ->take(10)
            ->get(['ticket_code', 'status', 'ticket_id', 'ticket_details_id']);
    }
}
