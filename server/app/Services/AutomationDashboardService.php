<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\UserLogin;
use Illuminate\Support\Facades\DB;

class AutomationDashboardService
{
    public function __construct(public ?UserLogin $user, public ?Ticket $tickets) {}

    public function ticketTotals()
    {
        $all_tickets_assigned = (clone $this->tickets)
            ->where('assigned_person', $this->user->login_id)
            ->count();

        $ticket_counts = (clone $this->tickets)
            ->where('assigned_person', $this->user->login_id)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            "all_tickets_assigned"          => $all_tickets_assigned,
            "all_edited_tickets_assigned"   => (int) ($ticket_counts[TicketStatus::EDITED?->value] ?? 0),
            "all_pending_tickets_assigned"  => (int) ($ticket_counts[TicketStatus::PENDING?->value] ?? 0),
            "all_rejected_tickets_assigned" => (int) ($ticket_counts[TicketStatus::REJECTED?->value] ?? 0)
        ];
    }

    public function recentTicketRecordsData()
    {
        $recent_pending_tickets = (clone $this->tickets)
            ->with('ticketDetail.ticketCategory')
            ->where('status', TicketStatus::PENDING)
            ->where('assigned_person', $this->user->login_id)
            ->latest('ticket_id')
            ->take(5)
            ->get();

        $recent_edited_tickets = (clone $this->tickets)
            ->with('ticketDetail.ticketCategory')
            ->where('status', TicketStatus::EDITED)
            ->where('assigned_person', $this->user->login_id)
            ->latest('ticket_id')
            ->take(5)
            ->get();

        $recent_rejected_tickets = (clone $this->tickets)
            ->with('ticketDetail.ticketCategory')
            ->where('status', TicketStatus::REJECTED)
            ->where('assigned_person', $this->user->login_id)
            ->latest('ticket_id')
            ->take(5)
            ->get();

        return [
            "recent_pending_tickets"  => $recent_pending_tickets,
            "recent_edited_tickets"   => $recent_edited_tickets,
            "recent_rejected_tickets" => $recent_rejected_tickets
        ];
    }
}
