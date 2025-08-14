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

        $search = request('search');

        $filter_by = request('filter_by');

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
            ->when(
                $filter_by !== 'ALL',
                fn($q)
                =>
                $q->where('status', $filter_by)
            )
            ->when(
                $search,
                fn($q)
                =>
                $q->where(
                    fn($q)
                    =>
                    $q->where('ticket_code', 'LIKE', "%{$search}%")
                        ->orWhere('branch_name', 'LIKE', "%{$search}%")
                        ->orWhereHas(
                            'ticketDetail',
                            fn($q)
                            =>
                            $q->whereHas(
                                'ticketCategory',
                                fn($q)
                                =>
                                $q->where('category_name', 'LIKE', "%{$search}%")
                                    ->orWhere('category_shortcut', 'LIKE', "%{$search}%")
                            )
                        )
                        ->orWhereHas(
                            'userLogin',
                            fn($q)
                            =>
                            $q->whereHas(
                                'userDetail',
                                fn($q)
                                =>
                                $q->where('fname', 'LIKE', "%{$search}%")
                                    ->orWhere('lname', 'LIKE', "%{$search}%")
                                    ->orWhereRaw('CONCAT(fname, " ", lname) LIKE ?', ["%{$search}%"])
                                    ->orWhereRaw('CONCAT(lname, " ", fname) LIKE ?', ["%{$search}%"])
                            )
                        )
                        ->orWhereHas(
                            'assignedTicket',
                            fn($q)
                            =>
                            $q->whereHas(
                                'userDetail',
                                fn($q)
                                =>
                                $q->where('fname', 'LIKE', "%{$search}%")
                                    ->orWhere('lname', 'LIKE', "%{$search}%")
                                    ->orWhereRaw('CONCAT(fname, " ", lname) LIKE ?', ["%{$search}%"])
                                    ->orWhereRaw('CONCAT(lname, " ", fname) LIKE ?', ["%{$search}%"])
                            )
                        )
                )
            )
            ->when($ticket_category, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticket_category)))
            ->when($bcode, fn($query) => $query->where('branch_id', $bcode))
            ->when($userRole->role_name !== UserRoles::ADMIN, function ($query) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                $query->where(function ($subQuery) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                    if ($userRole->role_name === UserRoles::STAFF) {
                        $subQuery->where('login_id', Auth::id())
                            ->whereNot('status', TicketStatus::EDITED);
                    }
                    if ($userRole->role_name === UserRoles::AUTOMATION) {
                        $subQuery->where(fn($q) => $q->whereHas('editedBy')->orWhereHas('assignedTicket'))
                            ->whereIn('status', TicketStatus::PENDING)
                            ->whereIn('branch_id', $automationBranches);
                    }
                    if ($userRole->role_name === UserRoles::BRANCH_HEAD) {
                        $subQuery->whereNot('status', TicketStatus::EDITED)
                            ->where('branch_id', $user->blist_id);
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
                        $subQuery->whereNot('status', TicketStatus::EDITED)
                            ->where('login_id', Auth::id())
                            ->orWhere('branch_id', $user->blist_id);
                    }
                });
            })
            ->orderBy('ticket_id', 'desc')
            ->paginate($take);

        return response()->json([
            "message"       => "Tickets fetched successfully",
            "data"          => $tickets
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
