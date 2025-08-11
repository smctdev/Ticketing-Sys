<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bcode = request('bcode');

        $ticket_category = request('ticket_category');

        $take = request('limit');

        $user = Auth::user();

        $userRole = $user->userRole;

        $automationBranches = $user->assignedBranches->pluck('blist_id');

        $assignedBranchCas = $user->assignedBranchCas->pluck('blist_id');

        $assignedAreaManagers = $user->assignedAreaManagers->pluck('blist_id');

        $accountingHeadCodes = $user->assignedCategories->pluck('group_code');

        $tickets = Ticket::with(
            'userLogin.userDetail',
            'userLogin.userRole',
            'userLogin.branch',
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'assignedTicket.userDetail',
            'assignedTicket.userRole',
            'assignedTicket.branch',
            'approveAcctgStaff',
            'approveHead',
            'approveAutm',
            'approveAcctgSup',
            'branch'
        )
            ->when($ticket_category, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticket_category)))
            ->when($bcode, fn($query) => $query->where('branch_id', $bcode))
            ->when($userRole->role_name !== UserRoles::ADMIN, function ($query) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes) {
                $query->where(function ($subQuery) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes) {
                    if ($userRole->role_name === UserRoles::STAFF) {
                        $subQuery->where('login_id', Auth::id());
                    }
                    if ($userRole->role_name === UserRoles::AUTOMATION) {
                        $subQuery->where(fn($q) => $q->whereHas('editedBy')->orWhereHas('assignedTicket'))
                            ->whereIn('status', [TicketStatus::PENDING, TicketStatus::EDITED])
                            ->whereIn('branch_id', $automationBranches);
                    }
                    if ($userRole->role_name === UserRoles::BRANCH_HEAD) {
                        $subQuery->whereIn('status', [TicketStatus::REJECTED, TicketStatus::EDITED])
                            ->where('branch_id', $userRole->user_role_id);
                    }

                    if ($userRole->role_name === UserRoles::CAS) {
                        $subQuery->where('status', TicketStatus::PENDING)
                            ->whereIn('branch_id', $assignedBranchCas);
                    }

                    if ($userRole->role_name === UserRoles::AREA_MANAGER) {
                        $subQuery->where('status', TicketStatus::PENDING)
                            ->whereIn('branch_id', $assignedAreaManagers);
                    }

                    if ($userRole->role_name === UserRoles::ACCOUNTING_HEAD) {
                        $subQuery->where('status', TicketStatus::PENDING)
                            ->whereHas('ticketDetail', fn($triQuery) => $triQuery->whereHas('ticketCategory', fn($ticketQuery) => $ticketQuery->whereIn('group_code', $accountingHeadCodes)));
                    }

                    if ($userRole->role_name === UserRoles::ACCOUNTING_STAFF) {
                        $subQuery->whereIn('status', [TicketStatus::PENDING, TicketStatus::REJECTED])
                            ->where('login_id', Auth::id());
                    }
                });
            })
            ->orderBy('ticket_id', 'desc')
            ->paginate($take);

        return response()->json([
            "count" => $tickets->total(),
            "rows"  => $tickets->map(function ($ticket) {
                return [
                    "ticket_id"                     => $ticket->ticket_id,
                    "ticket_code"                   => $ticket->ticket_code,
                    "login_id"                      => $ticket->login_id,
                    "ticket_details_id"             => $ticket->ticket_details_id,
                    "branch_id"                     => $ticket->branch_id,
                    "branch_name"                   => $ticket->branch_name,
                    "status"                        => $ticket->status,
                    "isCounted"                     => $ticket->isCounted,
                    "isApproved"                    => $ticket->isApproved,
                    "assigned_person"               => $ticket->assigned_person,
                    "edited_by"                     => $ticket->edited_by,
                    "notifStaff"                    => $ticket->notifStaff,
                    "notifHead"                     => $ticket->notifHead,
                    "notifAccounting"               => $ticket->notifAccounting,
                    "notifAutomation"               => $ticket->notifAutomation,
                    "notifAUTM"                     => $ticket->notifAUTM,
                    "notifAdmin"                    => $ticket->notifAdmin,
                    "displayTicket"                 => $ticket->displayTicket,
                    "approveHead"                   => $ticket->approveHead,
                    "approveAcctgStaff"             => $ticket->approveAcctgStaff,
                    "approveAcctgSup"               => $ticket->approveAcctgSup,
                    "approveAutm"                   => $ticket->approveAutm,
                    "answer"                        => $ticket->answer,
                    "appTBranchHead"                => $ticket->appTBranchHead,
                    "appTAccStaff"                  => $ticket->appTAccStaff,
                    "appTAccHead"                   => $ticket->appTAccHead,
                    "appTAutomationHead"            => $ticket->appTAutomationHead,
                    "appTEdited"                    => $ticket->appTEdited,
                    "UserTicket"                    => [
                        "login_id"                  => $ticket->userLogin?->login_id,
                        "blist_id"                  => $ticket->userLogin?->blist_id,
                        "requesting_password"       => $ticket->userLogin?->requesting_password,
                        "UserDetails"               => $ticket->userLogin?->userDetail,
                        "UserRole"                  => $ticket->userLogin?->userRole,
                        "Branch"                    => $ticket->userLogin?->branch,
                    ],
                    "ApproveAccountingStaff"        => $ticket->approveAcctgStaff,
                    "ApproveAccountingHead"         => $ticket->approveHead,
                    "Branch"                        => $ticket->branch,
                    "TicketDetails"                 => [
                        "ticket_details_id"         => $ticket->ticketDetail?->ticket_details_id,
                        "ticket_transaction_date"   => $ticket->ticketDetail?->ticket_transaction_date,
                        "td_ref_number"             => $ticket->ticketDetail?->td_ref_number,
                        "td_purpose"                => $ticket->ticketDetail?->td_purpose,
                        "td_from"                   => $ticket->ticketDetail?->td_from,
                        "td_to"                     => $ticket->ticketDetail?->td_to,
                        "td_note"                   => $ticket->ticketDetail?->td_note,
                        "td_support"                => $ticket->ticketDetail?->td_support,
                        "supplier"                  => $ticket->ticketDetail?->supplier,
                        "date_created"              => $ticket->ticketDetail?->date_created,
                        "time"                      => $ticket->ticketDetail?->time,
                        "date_completed"            => $ticket->ticketDetail?->date_completed,
                        "Category"                  => $ticket->ticketDetail?->ticketCategory,
                        "Supplier"                  => $ticket->ticketDetail?->supplier
                    ],
                    "AssignedTicket"                => [
                        "login_id"                  => $ticket->assignedTicket?->login_id,
                        "requesting_password"       => $ticket->assignedTicket?->requesting_password,
                        "UserDetails"               => $ticket->assignedTicket?->userDetail,
                        "UserRole"                  => $ticket->assignedTicket?->userRole,
                        "Branch"                    => $ticket->assignedTicket?->branch
                    ],
                ];
            })
        ], 200);
    }

    public function reports()
    {
        $take = request('limit');

        $startDate = request('startDate');
        $endDate = request('endDate');
        $branchCode = request('bcode');
        $ticketCategory = request('ticket_category');
        $branchCategory = request('branch_category');

        $tickets = Ticket::with(
            'userLogin.userDetail',
            'userLogin.userRole',
            'userLogin.branch',
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'assignedTicket.userDetail',
            'assignedTicket.userRole',
            'assignedTicket.branch',
            'approveAcctgStaff',
            'approveHead',
            'approveAutm',
            'approveAcctgSup',
            'branch'
        )
            ->when($startDate && $endDate, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->whereBetween('date_created', [$startDate, $endDate])))
            ->when($branchCode, fn($query) => $query->where('branch_id', $branchCode))
            ->when($ticketCategory, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticketCategory)))
            ->when($branchCategory, fn($query) => $query->whereHas('branch', fn($subQuery) => $subQuery->where('category', $branchCategory)))
            ->whereHas('ticketDetail', fn($query) => $query->whereNotNull('date_completed')
                ->where('date_completed', '!=', ''))
            ->where('status', TicketStatus::EDITED)
            ->orderBy('ticket_id', 'desc')
            ->paginate($take)
            ->groupBy(fn($item) => implode('|', [
                $item->branch_name,
                $item->isCounted,
                $item->branch->b_code,
                $item->branch->category,
                $item->ticketDetail->ticketCategory->category_name,
                $item->ticketDetail->ticketCategory->category_shortcut,
            ]))->map(function ($group) {
                $first = $group->first();
                return [
                    'ticket_code'                   => $first->ticket_code,
                    'branch_name'                   => $first->branch_name,
                    'counted'                       => $first->isCounted,
                    'branch_code'                   => $first->branch->b_code,
                    'branch_category'               => $first->branch->category,
                    'category_name'                 => $first->ticketDetail->ticketCategory->category_name,
                    'category_shortcut'             => $first->ticketDetail->ticketCategory->category_shortcut,
                    'ticket_count'                  => $group->count(),
                    "Branch"                        => $first->branch,
                    "TicketDetails"                 => [
                        "ticket_details_id"         => $first->ticketDetail?->ticket_details_id,
                        "ticket_transaction_date"   => $first->ticketDetail?->ticket_transaction_date,
                        "td_ref_number"             => $first->ticketDetail?->td_ref_number,
                        "td_purpose"                => $first->ticketDetail?->td_purpose,
                        "td_from"                   => $first->ticketDetail?->td_from,
                        "td_to"                     => $first->ticketDetail?->td_to,
                        "td_note"                   => $first->ticketDetail?->td_note,
                        "td_support"                => $first->ticketDetail?->td_support,
                        "supplier"                  => $first->ticketDetail?->supplier,
                        "date_created"              => $first->ticketDetail?->date_created,
                        "time"                      => $first->ticketDetail?->time,
                        "date_completed"            => $first->ticketDetail?->date_completed,
                        "Category"                  => $first->ticketDetail?->ticketCategory,
                    ],
                ];
            })->values();


        $tckts = Ticket::when($startDate && $endDate, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->whereBetween('date_created', [$startDate, $endDate])))
            ->when($branchCode, fn($query) => $query->where('branch_id', $branchCode))
            ->when($ticketCategory, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticketCategory)))
            ->when($branchCategory, fn($query) => $query->whereHas('branch', fn($subQuery) => $subQuery->where('category', $branchCategory)))
            ->whereHas('ticketDetail', fn($query) => $query->whereNotNull('date_completed')
                ->where('date_completed', '!=', ''))
            ->where('status', TicketStatus::EDITED)
            ->get();

        $groupedTickets = $tckts->groupBy(function ($item) {
            return implode('|', [
                $item->branch_name,
                $item->isCounted,
                $item->branch->b_code,
                $item->branch->category,
                $item->ticketDetail->ticketCategory->category_name,
                $item->ticketDetail->ticketCategory->category_shortcut,
            ]);
        });

        $totalTickets = $groupedTickets->count();

        return response()->json([
            "count" => $totalTickets,
            "data"  => $tickets
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    public function updateNotif(Request $request, $id)
    {
        $ticket = Ticket::find($id);
        $userRole = Auth::user()->userRole;

        if (!$ticket) {
            return response()->json("No ticket found", 404);
        }

        $dataToUpdate = [];

        if ($userRole->role_name === UserRoles::ADMIN || $userRole->role_name === UserRoles::AUTOMATION) {
            $dataToUpdate["notifAdmin"] = 0;
        }

        if ($userRole->role_name === UserRoles::ACCOUNTING_HEAD) {
            $dataToUpdate["notifAccounting"] = 0;
        }

        if ($userRole->role_name === UserRoles::BRANCH_HEAD) {
            $dataToUpdate["notifHead"] = 0;
        }

        if ($userRole->role_name === UserRoles::STAFF) {
            $dataToUpdate["notifStaff"] = 0;
        }

        if ($userRole->role_name === UserRoles::ACCOUNTING_STAFF) {
            $dataToUpdate["notifAccounting"] = 0;
        }

        if ($userRole->role_name === UserRoles::AUTOMATION_MANAGER) {
            $dataToUpdate["notifAUTM"] = 0;
        }

        if (!empty($dataToUpdate)) {
            $ticket->update($dataToUpdate);
        }

        return response()->json("Ticket updated successfully", 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
