<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\TicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Ticket;
use App\Models\TicketDetail;
use App\Models\UserLogin;
use App\Notifications\TicketNotification;
use App\Services\ReportsService;
use App\Services\TicketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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

        $ticket_type = request('ticket_type');

        $user = Auth::user();

        $userRole = $user->userRole;

        $assignedBranchCas = $user->assignedBranchCas->pluck('blist_id');

        $assignedAreaManagers = $user->assignedAreaManagers->pluck('blist_id');

        $accountingHeadCodes = $user->assignedCategories->pluck('group_code');

        $isAdmin = collect([UserRoles::ADMIN, UserRoles::AUTOMATION_ADMIN, UserRoles::SUPER_ADMIN])->contains($userRole->role_name);

        $tickets = Ticket::with(
            'userLogin.userDetail',
            'userLogin.userRole',
            'userLogin.branch',
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'ticketDetail.subCategory',
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
            'branch',
        )
            ->when(
                $status !== 'ALL',
                fn($q)
                =>
                $q->where('status', $status)
            )
            ->search($search)
            ->when($ticket_type !== 'ALL', fn($query) => $query->whereRelation('ticketDetail', 'ticket_type', $ticket_type))
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
                                ->where('displayTicket', Auth::id());
                            // ->orWhere('last_approver', Auth::id());
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
                                // ->whereHas(
                                //     'ticketDetail',
                                //     fn($triQuery)
                                //     =>
                                //     $triQuery->whereHas(
                                //         'ticketCategory',
                                //         fn($ticketQuery)
                                //         =>
                                //         $ticketQuery->whereIn('group_code', $accountingHeadCodes)
                                //     )
                                // );
                                ->where('displayTicket', Auth::id());
                            break;
                        case UserRoles::ACCOUNTING_STAFF:
                            $subQuery->whereNot('status', TicketStatus::EDITED)
                                ->where('login_id', Auth::id())
                                // ->orWhereHas(
                                //     'ticketDetail',
                                //     fn($triQuery)
                                //     =>
                                //     $triQuery->whereHas(
                                //         'ticketCategory',
                                //         fn($ticketQuery)
                                //         =>
                                //         $ticketQuery->whereIn('group_code', $accountingHeadCodes)
                                //     )
                                // );
                                ->orWhere('displayTicket', Auth::id());
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

    public function auditIndex()
    {
        $bcode = request('bcode');

        $ticket_category = request('ticket_category');

        $take = request('limit');

        $search = request('search');

        $ticket_type = request('ticket_type');

        $tickets = Ticket::with(
            'userLogin.userDetail',
            'userLogin.userRole',
            'userLogin.branch',
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'ticketDetail.subCategory',
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
            'branch',
        )
            ->search($search)
            ->when($ticket_type !== 'ALL', fn($query) => $query->whereRelation('ticketDetail', 'ticket_type', $ticket_type))
            ->when($ticket_category, fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticket_category)))
            ->when($bcode, fn($query) => $query->where('branch_id', $bcode))
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
        $ticket_type = request('ticket_type');

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
            $search,
            $ticket_type
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
            "message"   => "Ticket with ticket code of {$data?->ticket_code} created successfully",
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

        $field = match (true) {
            $user->isAutomation()        => 'td_note_bh',
            $user->isAutomationManager() => 'td_note',
            $user->isAccountingStaff()   => 'td_note_accounting',
        };

        $validateData = [
            $field              => ["nullable", Rule::requiredIf(!$user->isAccountingHead() && !$user->isBranchHead()), 'max:5000', 'min:1']
        ];

        $validateDataMessage = [
            "{$field}.required" => 'Note is required',
            "{$field}.max"      => 'Note must be less than 5000 characters',
            "{$field}.min"      => 'Note must be at least 1 character',
        ];

        $request->validate($validateData, $validateDataMessage);

        $data = $ticketService->reviseTicket($id, $request);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket->ticket_code} revised successfully",
        ], 200);
    }

    public function approve(Request $request, TicketService $ticketService, string $id)
    {
        $user = Auth::user();

        $field = $user->isAutomation() ? 'td_note_bh' : 'td_note';

        $validateData = [
            $field            => ["nullable", Rule::requiredIf(!$user->isAccountingHead() && !$user->isAccountingStaff() && !$user->isBranchHead()), 'max:5000', 'min:1']
        ];

        $validateDataMessage = [
            "{$field}.required"   => 'Note is required',
            "{$field}.max"        => 'Note must be less than 5000 characters',
            "{$field}.min"        => 'Note must be at least 1 character',
        ];

        $request->validate($validateData, $validateDataMessage);

        $data = $ticketService->approveTicket($id, $request);

        return response()->json([
            'message'           => "Ticket with ticket code of {$data->ticket->ticket_code} approved successfully",
        ], 200);
    }

    public function markAsEdited(Request $request, TicketService $ticketService, string $id)
    {
        $validateData = [
            'td_note_bh'          => ['required', 'max:5000', 'min:1'],
            'is_counted'          => ['required']
        ];

        $validateDataMessage = [
            'td_note_bh.required' => 'Note is required',
            'td_note_bh.max'      => 'Note must be less than 5000 characters',
            'td_note_bh.min'      => 'Note must be at least 1 character',
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
            'note'          => ['required', 'max:5000', 'min:1']
        ]);

        [$old_data, $new_data, $ticket_code] = $ticketService->editNote($request, $ticketCode);

        return response()->json([
            'message'           => "Ticket with ticket code of {$ticket_code} note has been changed from {$old_data} to {$new_data} successfully",
        ], 200);
    }

    public function transferTicketToAutomation(Request $request, $ticketCode)
    {
        $request->validate([
            'automation'        => ['required']
        ]);

        $user = UserLogin::findOrFail($request->automation);

        $isAutomation = $user->isAutomation() || $user->isAutomationManager() || $user->isAutomationAdmin();

        if (!$isAutomation) {
            abort(400, 'The user selected is not an automation');
        }

        $data = Ticket::where('ticket_code', $ticketCode)->first();

        if ((int) $data->assigned_person === (int) $request->automation) {
            abort(200, 'Nothing changed');
        }

        $itemToUpdate = [
            'assigned_person' => $request->automation,
        ];

        if ($data->pendingUser->isAutomation()) {
            $itemToUpdate['displayTicket'] = $request->automation;
        }

        $data->update($itemToUpdate);

        $user->notify(new TicketNotification(
            "Hello, new ticket {$data->ticket_code} has been assigned to you",
            $data->ticket_code,
            $user->userDetail->profile_pic,
            $user->full_name,
            $user->login_id
        ));

        activity()
            ->causedBy(Auth::user())
            ->performedOn($data)
            ->log("Transferred a ticket");

        return response()->json([
            'message'           => "Ticket with ticket code of {$ticketCode} has been transferred to {$data->assignedPerson->full_name} automation successfully",
        ], 200);
    }


    public function directToAutomation(TicketDetail $ticket_detail)
    {

        if ($ticket_detail->ticket->status !== TicketStatus::PENDING) {
            abort(400, 'You can not direct this ticket because it has been edited or rejected');
        }

        $ticket_detail->ticket->update([
            'displayTicket' => $ticket_detail?->ticket?->assignedPerson?->login_id
        ]);


        $ticket_detail?->ticket?->assignedPerson->notify(new TicketNotification(
            "Hello, new ticket {$ticket_detail->ticket->ticket_code} has been assigned to you",
            $ticket_detail->ticket->ticket_code,
            $ticket_detail?->ticket?->assignedPerson->userDetail->profile_pic,
            $ticket_detail?->ticket?->assignedPerson->full_name,
            $ticket_detail?->ticket?->assignedPerson->login_id
        ));

        activity()
            ->causedBy(Auth::user())
            ->performedOn($ticket_detail)
            ->log("Directed a ticket with ticket code of {$ticket_detail?->ticket?->ticket_code} to automation");

        return response()->json([
            'message'           => "Ticket with ticket code of {$ticket_detail?->ticket?->ticket_code} has been directed automation successfully",
        ], 200);
    }

    public function downloadZip(TicketDetail $ticket_detail, TicketService $ticketService)
    {
        $zipPath = $ticketService->downloadZip($ticket_detail->ticket_details_id);

        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
