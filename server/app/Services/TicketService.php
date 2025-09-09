<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Models\AssignedBranch;
use App\Models\Ticket;
use App\Models\TicketDetail;
use App\Models\UserDetail;
use App\Models\UserLogin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

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
            'assignedPerson.userDetail',
            'assignedPerson.userRole',
            'assignedPerson.branch',
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

    public function storeTicket($request)
    {
        $user = Auth::user();

        $automationAdmin = UserLogin::query()
            ->whereHas(
                'userRole',
                fn($query)
                =>
                $query->where('role_name', UserRoles::AUTOMATION_ADMIN)
            )
            ->first();

        $assignedAutomation = AssignedBranch::with('assignedAutomation', 'branch')
            ->where('blist_id', $user->blist_id)
            ->first();


        $data = DB::transaction(
            function () use ($request, $user, $assignedAutomation, $automationAdmin) {
                $paths = [];
                $file = $request->file('ticket_support');

                foreach ($file as $f) {
                    $fileName =  time() . '-' . $f->getClientOriginalName();
                    $paths[] = $f->storeAs('uploads', $fileName, 'public');
                }

                $ticketDetail = TicketDetail::create([
                    'ticket_category_id'        => $request->ticket_category,
                    'ticket_transaction_date'   => $request->ticket_transaction_date,
                    'td_support'                => $paths,
                    'date_created'              => now(),
                    'time'                      => now()->format('h:i:s A'),
                ]);

                do {
                    $code = rand(100000, 999999);
                } while (
                    Ticket::query()
                    ->where('ticket_code', $code)
                    ->exists()
                );

                $ticket = $ticketDetail->ticket()->create(
                    [
                        'ticket_code'       => $code,
                        'login_id'          => $user->login_id,
                        'branch_id'         => $user->blist_id,
                        'branch_name'       => $user->branch->b_name,
                        'status'            => TicketStatus::PENDING,
                        'isCounted'         => 1,
                        'isApproved'        => 0,
                        'assigned_person'   => $assignedAutomation ? $assignedAutomation->assignedAutomation->login_id : $automationAdmin->login_id,
                    ]
                );

                return $ticket;
            }
        );

        return $data;
    }
}
