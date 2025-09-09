<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tickets = Ticket::with(
            'userLogin.userDetail',
            'userLogin.userRole',
            'userLogin.branch',
            'ticketDetail.ticketCategory',
            'ticketDetail.supplier',
            'assignedPerson.userDetail',
            'assignedPerson.userRole',
            'assignedPerson.branch',
        )
            ->orderBy('ticket_id', 'asc')
            ->get();

        return response()->json($tickets->map(function ($ticket) {
            return [
                "ticket_id"             => $ticket->ticket_id,
                "ticket_code"           => $ticket->ticket_code,
                "login_id"              => $ticket->login_id,
                "ticket_details_id"     => $ticket->ticket_details_id,
                "branch_id"             => $ticket->branch_id,
                "branch_name"           => $ticket->branch_name,
                "status"                => $ticket->status,
                "isCounted"             => $ticket->isCounted,
                "isApproved"            => $ticket->isApproved,
                "assigned_person"       => $ticket->assigned_person,
                "edited_by"             => $ticket->edited_by,
                "notifStaff"            => $ticket->notifStaff,
                "notifHead"             => $ticket->notifHead,
                "notifAccounting"       => $ticket->notifAccounting,
                "notifAutomation"       => $ticket->notifAutomation,
                "notifAUTM"             => $ticket->notifAUTM,
                "notifAdmin"            => $ticket->notifAdmin,
                "displayTicket"         => $ticket->displayTicket,
                "approveHead"           => $ticket->approveHead,
                "approveAcctgStaff"     => $ticket->approveAcctgStaff,
                "approveAcctgSup"       => $ticket->approveAcctgSup,
                "approveAutm"           => $ticket->approveAutm,
                "answer"                => $ticket->answer,
                "appTBranchHead"        => $ticket->appTBranchHead,
                "appTAccStaff"          => $ticket->appTAccStaff,
                "appTAccHead"           => $ticket->appTAccHead,
                "appTAutomationHead"    => $ticket->appTAutomationHead,
                "appTEdited"            => $ticket->appTEdited,
                "UserTicket"                    => [
                    "login_id"                  => $ticket->userLogin?->login_id,
                    "blist_id"                  => $ticket->userLogin?->blist_id,
                    "requesting_password"       => $ticket->userLogin?->requesting_password,
                    "UserDetails"               => $ticket->userLogin?->userDetail,
                    "UserRole"                  => $ticket->userLogin?->userRole,
                    "Branch"                    => $ticket->userLogin?->branch,
                ],
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
                "AssignedPerson"                => [
                    "login_id"                  => $ticket->assignedPerson?->login_id,
                    "requesting_password"       => $ticket->assignedPerson?->requesting_password,
                    "UserDetails"               => $ticket->assignedPerson?->userDetail,
                    "UserRole"                  => $ticket->assignedPerson?->userRole,
                    "Branch"                    => $ticket->assignedPerson?->branch
                ],
            ];
        }), 200);
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
