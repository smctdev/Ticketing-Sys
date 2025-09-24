<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\TicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Ticket;
use App\Services\ReportsService;
use App\Services\TicketService;
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

        $assignedBranchCas = $user->assignedBranchCas->pluck('blist_id');

        $assignedAreaManagers = $user->assignedAreaManagers->pluck('blist_id');

        $accountingHeadCodes = $user->assignedCategories->pluck('group_code');

        $isAdmin = collect([UserRoles::ADMIN, UserRoles::AUTOMATION_ADMIN])->contains($userRole->role_name);

        $tickets = Ticket::with(
            'userLogin.userDetail',
            'userLogin.userRole',
            'userLogin.branch',
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'assignedPerson.userDetail',
            'assignedPerson.userRole',
            'assignedPerson.branch',
            'approveAcctgStaff.userDetail',
            'approveAcctgStaff.userRole',
            'approveAcctgStaff.branch',
            'approveHead.userDetail',
            'approveHead.userRole',
            'approveHead.branch',
            'approveAutm.userDetail',
            'approveAutm.userRole',
            'approveAutm.branch',
            'approveAcctgSup.userDetail',
            'approveAcctgSup.userRole',
            'approveAcctgSup.branch',
            'pendingUser.userDetail',
            'pendingUser.userRole',
            'pendingUser.branch',
            'lastApprover.userDetail',
            'lastApprover.userRole',
            'lastApprover.branch',
            'branch'
        )
            ->when(
                $status !== 'ALL',
                fn($q)
                =>
                $q->where('status', $status)
            )
            ->search($search)
            ->when($ticket_category, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticket_category)))
            ->when($bcode, fn($query) => $query->where('branch_id', $bcode))
            ->when(!$isAdmin, function ($query) use ($userRole, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                $query->where(function ($subQuery) use ($userRole, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                    $userBranchIds = explode(',', $user->blist_id);

                    switch ($userRole->role_name) {
                        case UserRoles::STAFF:
                            $subQuery->where('login_id', Auth::id())
                                ->whereNot('status', TicketStatus::EDITED);
                            break;
                        case UserRoles::AUTOMATION:
                        case UserRoles::AUTOMATION_ADMIN:
                            $subQuery->where('assigned_person', $user->login_id)
                                ->where('status', TicketStatus::PENDING);
                            break;
                        case UserRoles::AUTOMATION_MANAGER:
                            $subQuery->whereNot('status', TicketStatus::EDITED)
                                ->has('pendingUser');
                            break;
                        case UserRoles::BRANCH_HEAD:
                            $subQuery->whereNot('status', TicketStatus::EDITED)
                                ->whereIn('branch_id', $userBranchIds);
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
                                ->whereHas(
                                    'ticketDetail',
                                    fn($triQuery)
                                    =>
                                    $triQuery->whereHas(
                                        'ticketCategory',
                                        fn($ticketQuery)
                                        =>
                                        $ticketQuery->whereIn('group_code', $accountingHeadCodes)
                                    )
                                );
                            break;
                        case UserRoles::ACCOUNTING_STAFF:
                            $subQuery->whereNot('status', TicketStatus::EDITED)
                                ->where('login_id', Auth::id())
                                ->orWhereIn('branch_id', $userBranchIds);
                            break;
                    }
                });
            })
            ->when(
                $isAdmin,
                fn($query)
                =>
                $query->whereNot('status', TicketStatus::EDITED)
            )
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
        $created_start_date = request('created_start_date');
        $created_end_date = request('created_end_date');
        $branchCode = request('branch_code');
        $ticketCategory = request('ticket_category');
        $branchCategory = request('branch_type');
        $currentPage = request('page');
        $search = request('search');

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
            $created_start_date,
            $created_end_date,
            $branchCode,
            $ticketCategory,
            $branchCategory,
            $currentPage,
            $search
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
    public function store(TicketRequest $request, TicketService $ticketService)
    {
        $request->validated();

        $data = $ticketService->storeTicket($request);

        return response()->json([
            "message"   => "Ticket with ticket code of {$data->ticket_code} created successfully",
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ticket = Ticket::query()
            ->with(
                'userLogin.userDetail',
                'userLogin.userRole',
                'userLogin.branch',
                'ticketDetail.ticketCategory',
                'ticketDetail.supplier',
                'assignedPerson.userDetail',
                'assignedPerson.userRole',
                'assignedPerson.branch',
                'approveAcctgStaff.userDetail',
                'approveAcctgStaff.userRole',
                'approveAcctgStaff.branch',
                'approveHead.userDetail',
                'approveHead.userRole',
                'approveHead.branch',
                'approveAutm.userDetail',
                'approveAutm.userRole',
                'approveAutm.branch',
                'approveAcctgSup.userDetail',
                'approveAcctgSup.userRole',
                'approveAcctgSup.branch',
                'pendingUser.userDetail',
                'pendingUser.userRole',
                'pendingUser.branch',
                'lastApprover.userDetail',
                'lastApprover.userRole',
                'lastApprover.branch',
                'branch'
            )
            ->where('ticket_code', $id)->first();

        return response()->json([
            "message"   => "Ticket fetched successfully",
            "data"      => $ticket
        ], 200);
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
    public function update(UpdateTicketRequest $request, TicketService $ticketService, string $id)
    {
        $request->validated();

        $data = $ticketService->updateTicket($request, $id);

        return response()->json([
            "message"   => "Ticket with ticket code of {$data->ticket_code} updated successfully",
        ], 200);
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
    public function destroy(TicketService $ticketService, string $id)
    {
        $data = $ticketService->deleteTicket($id);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket->ticket_code} deleted successfully",
        ], 200);
    }

    public function revise(Request $request, TicketService $ticketService, string $id)
    {
        $user = Auth::user();

        if ($user->isBranchHead()) {
            $validateData = [
                'td_note_bh'            => ['required', 'max:255', 'min:1']
            ];
            $validateDataMessage = [
                'td_note_bh.required'   => 'Note is required',
                'td_note_bh.max'        => 'Note must be less than 255 characters',
                'td_note_bh.min'        => 'Note must be at least 1 character',
            ];
        } else {
            $validateData = [
                'td_note'               => ['required', 'max:255', 'min:1']
            ];
            $validateDataMessage = [
                'td_note.required'      => 'Note is required',
                'td_note.max'           => 'Note must be less than 255 characters',
                'td_note.min'           => 'Note must be at least 1 character',
            ];
        }

        $request->validate($validateData, $validateDataMessage);

        $data = $ticketService->reviseTicket($id, $request);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket->ticket_code} revised successfully",
        ], 200);
    }

    public function approve(Request $request, TicketService $ticketService, string $id)
    {
        $user = Auth::user();

        if ($user->isBranchHead()) {
            $validateData = [
                'td_note_bh'            => ['required', 'max:255', 'min:1']
            ];
            $validateDataMessage = [
                'td_note_bh.required'   => 'Note is required',
                'td_note_bh.max'        => 'Note must be less than 255 characters',
                'td_note_bh.min'        => 'Note must be at least 1 character',
            ];
        } else {
            $validateData = [
                'td_note'               => ['required', 'max:255', 'min:1']
            ];
            $validateDataMessage = [
                'td_note.required'      => 'Note is required',
                'td_note.max'           => 'Note must be less than 255 characters',
                'td_note.min'           => 'Note must be at least 1 character',
            ];
        }

        $request->validate($validateData, $validateDataMessage);

        $data = $ticketService->approveTicket($id, $request);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket->ticket_code} approved successfully",
        ], 200);
    }

    public function markAsEdited(Request $request, TicketService $ticketService, string $id)
    {
        $validateData = [
            'td_note'               => ['required', 'max:255', 'min:1'],
            'is_counted'            => ['required']
        ];

        $validateDataMessage = [
            'td_note.required'      => 'Note is required',
            'td_note.max'           => 'Note must be less than 255 characters',
            'td_note.min'           => 'Note must be at least 1 character',
        ];

        $request->validate($validateData, $validateDataMessage);

        $data = $ticketService->markAsEdited($id, $request);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket->ticket_code} has been marked as edited successfully",
        ], 200);
    }

    public function returnToAutomation(TicketService $ticketService, $ticketCode)
    {
        $data = $ticketService->returnToAutomation($ticketCode);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket_code} has been returned to Automation successfully",
        ], 200);
    }

    public function markAsCountedOrNotCounted(TicketService $ticketService, $ticketCode)
    {
        $data = $ticketService->markedAsNotCountedOrCounted($ticketCode);

        $msg = $data->isCounted === 1 ? 'not counted' : 'counted';

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket_code} has been marked as {$msg} successfully",
        ], 200);
    }

    public function editNote(Request $request, TicketService $ticketService, $ticketCode)
    {
        $request->validate([
            'note'          => ['required', 'max:255', 'min:1']
        ]);

        [$old_data, $new_data, $ticket_code] = $ticketService->editNote($request, $ticketCode);

        return response()->json([
            'message'           => "Ticket with ticket code of {$ticket_code} note has been changed from {$old_data} to {$new_data} successfully",
        ], 200);
    }
}
