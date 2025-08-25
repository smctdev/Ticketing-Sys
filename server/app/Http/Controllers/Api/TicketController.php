<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Services\ReportsService;
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

        $status = request('status');

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
            'approveAcctgSup.userDetail',
            'branch'
        )
            ->when(
                $status !== 'ALL',
                fn($q)
                =>
                $q->where('status', $status)
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
                    switch ($userRole->role_name) {
                        case UserRoles::STAFF:
                            $subQuery->where('login_id', Auth::id())
                                ->whereNot('status', TicketStatus::EDITED);
                            break;
                        case UserRoles::AUTOMATION:
                            $subQuery->where(fn($q) => $q->whereHas('editedBy')->orWhereHas('assignedTicket'))
                                ->where('status', TicketStatus::PENDING)
                                ->whereIn('branch_id', $automationBranches);
                            break;
                        case UserRoles::BRANCH_HEAD:
                            $subQuery->whereNot('status', TicketStatus::EDITED)
                                ->where('branch_id', $user->blist_id);
                            break;
                        case UserRoles::CAS:
                            $subQuery->where('status', TicketStatus::PENDING)
                                ->whereIn('branch_id', $assignedBranchCas);
                            break;
                        case UserRoles::AREA_MANAGER:
                            $subQuery->where('status', TicketStatus::PENDING)
                                ->whereIn('branch_id', $assignedAreaManagers);
                            break;
                        case UserRoles::ACCOUNTING_HEAD:
                            $subQuery->where('status', TicketStatus::PENDING)
                                ->whereHas('ticketDetail', fn($triQuery) => $triQuery->whereHas('ticketCategory', fn($ticketQuery) => $ticketQuery->whereIn('group_code', $accountingHeadCodes)));
                            break;
                        case UserRoles::ACCOUNTING_STAFF:
                            $subQuery->whereNot('status', TicketStatus::EDITED)
                                ->where('login_id', Auth::id())
                                ->orWhere('branch_id', $user->blist_id);
                            break;
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

    public function reports(ReportsService $reportService)
    {
        $take = request('limit');
        $edited_start_date = request('edited_start_date');
        $edited_end_date = request('edited_end_date');
        $edited_transaction_start_date = request('edited_transaction_start_date');
        $edited_transaction_end_date = request('edited_transaction_end_date');
        $branchCode = request('branch_code');
        $ticketCategory = request('ticket_category');
        $branchCategory = request('branch_type');
        $currentPage = request('page');

        $user = Auth::user();

        $userRole = $user->userRole;

        $data = $reportService->getAllReports(
            $user,
            $userRole,
            $take,
            $edited_start_date,
            $edited_end_date,
            $edited_transaction_start_date,
            $edited_transaction_end_date,
            $branchCode,
            $ticketCategory,
            $branchCategory,
            $currentPage
        );

        return response()->json([
            "count" => $data->total(),
            "data"  => $data
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
        $user = Auth::user();

        if (!$ticket) {
            return response()->json("No ticket found", 404);
        }

        $dataToUpdate = [];

        if ($user->isAdmin() || $user->isAutomation()) {
            $dataToUpdate["notifAdmin"] = 0;
        } elseif ($user->isAccountingHead()) {
            $dataToUpdate["notifAccounting"] = 0;
        } elseif ($user->isBranchHead()) {
            $dataToUpdate["notifHead"] = 0;
        } elseif ($user->isStaff()) {
            $dataToUpdate["notifStaff"] = 0;
        } elseif ($user->isAccountingStaff()) {
            $dataToUpdate["notifAccounting"] = 0;
        } elseif ($user->isAutomationManager()) {
            $dataToUpdate["notifAUTM"] = 0;
        } elseif (!empty($dataToUpdate)) {
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
