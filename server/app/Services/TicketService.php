<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Events\DeleteTicketEvent;
use App\Models\AssignedBranch;
use App\Models\BranchList;
use App\Models\Ticket;
use App\Models\TicketDetail;
use App\Models\UserLogin;
use App\Notifications\TicketNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
        return Ticket::query()
            ->where([
                ['login_id', $this->user->login_id],
                ['status', TicketStatus::EDITED]
            ])
            ->count();
    }

    public function getTotalRejectedTickets()
    {
        return Ticket::query()
            ->where([
                ['login_id', $this->user->login_id],
                ['status', TicketStatus::REJECTED]
            ])
            ->count();
    }

    public function getTotalPendingTickets()
    {
        return Ticket::query()
            ->where([
                ['login_id', $this->user->login_id],
                ['status', TicketStatus::PENDING]
            ])
            ->count();
    }

    public function getRecentTickets()
    {
        return Ticket::with([
            'ticketDetail.ticketCategory:ticket_category_id,category_name',
            'ticketDetail:ticket_details_id,ticket_transaction_date,ticket_category_id',
            'editedBy.userDetail:user_details_id,fname,lname',
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
            ->get(['ticket_code', 'status', 'ticket_id', 'ticket_details_id', 'edited_by']);
    }

    private function filterByUserBranch($q, $user, $request)
    {
        $branchId = $user->hasMultipleBranches() ? $request->ticket_for :  $user->blist_id;

        return $q->where('blist_id', $branchId);
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

        $automationManager = UserLogin::query()
            ->whereHas(
                'userRole',
                fn($query)
                =>
                $query->where('role_name', UserRoles::AUTOMATION_MANAGER)
            )
            ->first();

        $assignedAutomation = AssignedBranch::with('assignedAutomation', 'branch')
            ->where(
                fn($q)
                =>
                $this->filterByUserBranch($q, $user, $request)
            )
            ->first();

        $assignedBranchHead = UserLogin::query()
            ->whereHas(
                'userRole',
                fn($query)
                =>
                $query->where('role_name', UserRoles::BRANCH_HEAD)
            )
            ->where(
                fn($q)
                =>
                $this->filterByUserBranch($q, $user, $request)
            )
            ->first();


        $data = DB::transaction(
            function () use ($request, $user, $assignedAutomation, $automationAdmin, $automationManager, $assignedBranchHead) {
                $paths = [];
                $file = $request->file('ticket_support');
                $branch = BranchList::find($request->ticket_for);

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

                $ticketToBeDisplay = match (true) {
                    $user->isStaff()        => $assignedBranchHead->login_id,
                    $user->isBranchHead()   => $automationManager->login_id,
                    $assignedAutomation     => $assignedAutomation->assignedAutomation->login_id,
                    default                 => $automationAdmin->login_id
                };

                $assignedPerson = match (true) {
                    $assignedAutomation     => $assignedAutomation->assignedAutomation->login_id,
                    default                 => $automationAdmin->login_id,
                };

                $ticket = $ticketDetail->ticket()->create(
                    [
                        'ticket_code'       => $code,
                        'login_id'          => $user->login_id,
                        'branch_id'         => $user->hasMultipleBranches() ? $branch->blist_id : $user->blist_id,
                        'branch_name'       => $user->hasMultipleBranches() ? $branch->b_name : $user->branch->b_name,
                        'status'            => TicketStatus::PENDING,
                        'isCounted'         => 1,
                        'isApproved'        => 0,
                        'assigned_person'   => $assignedPerson,
                        'displayTicket'     => $ticketToBeDisplay,
                    ]
                );

                $ticket->pendingUser->notify(new TicketNotification(
                    "New ticket from {$ticket->branch->b_name} - ({$ticket->branch->b_code})",
                    $ticket->ticket_code,
                    $user->userDetail->profile_pic,
                    $user->full_name,
                    $ticket->pendingUser->login_id
                ));

                return $ticket;
            }
        );

        return $data;
    }


    public function updateTicket($request, $id)
    {
        $data = DB::transaction(
            function () use ($request, $id) {
                $branch = BranchList::find($request->ticket_for);
                $ticketDetail = TicketDetail::findOrFail($id);

                if ($ticketDetail->ticket->status === TicketStatus::EDITED) {
                    abort(400, 'You can not edit this ticket because it has been edited');
                }

                $paths = [];

                $file = $request->file('ticket_support');

                if ($request->hasFile('ticket_support')) {
                    foreach ($file as $f) {
                        $fileName =  time() . '-' . $f->getClientOriginalName();
                        $paths[] = $f->storeAs('uploads', $fileName, 'public');
                    }
                }

                $existingPaths = $ticketDetail->td_support ?? [];

                $removedFile = $request->removed_file ?? [];


                if (count($existingPaths) === count($removedFile) && !$request->hasFile('ticket_support')) {
                    $request->validate([
                        'ticket_support'             => ['required', 'array'],
                        'ticket_support.*'           => ['file', 'max:1024'],
                    ], [
                        'ticket_support.required'    => 'At least one support file is required.',
                        'ticket_support.*.file'      => 'Each support upload must be a valid file.',
                        'ticket_support.*.max'       => 'Please upload a file less than 1MB.',
                    ]);
                }

                $remainingPaths = array_diff($existingPaths, $removedFile ?? []);

                $newPaths = array_merge($remainingPaths, $paths ?? []);

                if ($removedFile) {
                    foreach ($removedFile as $f) {
                        if (Storage::disk('public')->exists($f)) {
                            Storage::disk('public')->delete($f);
                        }
                    }
                }

                $ticketDetail->update([
                    'ticket_category_id'        => $request->ticket_category,
                    'ticket_transaction_date'   => $request->ticket_transaction_date,
                    'td_support'                => $newPaths,
                ]);

                $ticketDetail->ticket->update(
                    [
                        'status'            => TicketStatus::PENDING,
                    ]
                );

                $ticketDetail->ticket->pendingUser->notify(new TicketNotification(
                    "Ticket from {$ticketDetail->ticket->branch->b_name} - ({$ticketDetail->ticket->branch->b_code}) has been updated",
                    $ticketDetail->ticket->ticket_code,
                    $this->user->userDetail->profile_pic,
                    $this->user->full_name,
                    $ticketDetail->ticket->pendingUser->login_id
                ));

                return $ticketDetail->ticket;
            }
        );

        return $data;
    }

    public function deleteTicket($id)
    {
        $ticketDetail = TicketDetail::findOrFail($id);

        DeleteTicketEvent::dispatch($ticketDetail->ticket->ticket_code);

        foreach ($ticketDetail->td_support as $support) {
            if (Storage::disk('public')->exists($support)) {
                Storage::disk('public')->delete($support);
            }
        }

        $ticketDetail->ticket->delete();

        $ticketDetail->delete();

        return $ticketDetail;
    }

    public function reviseTicket($id, $request)
    {
        $ticketDetail = TicketDetail::findOrFail($id);

        if ($this->user->isBranchHead()) {
            $requestData = [
                'td_note_bh'    => $request->td_note_bh
            ];
        } else {
            $requestData = [
                'td_note'       => $request->td_note
            ];
        }

        $ticketDetail->update($requestData);

        $ticketDetail->ticket->update([
            'status'        => TicketStatus::REJECTED
        ]);

        $ticketDetail->ticket->userLogin->notify(new TicketNotification(
            "Hello, your ticket {$ticketDetail->ticket->ticket_code} has been rejected",
            $ticketDetail->ticket->ticket_code,
            $this->user->userDetail->profile_pic,
            $this->user->full_name,
            $ticketDetail->ticket->userLogin->login_id
        ));

        return $ticketDetail;
    }

    public function approveTicket($id, $request)
    {
        $ticketDetail = TicketDetail::findOrFail($id);

        $ticketApprovedData = [
            'last_approver'     => $this->user->login_id,
        ];

        $automationManager = UserLogin::query()
            ->whereHas(
                'userRole',
                fn($query)
                =>
                $query->where('role_name', UserRoles::AUTOMATION_MANAGER)
            )
            ->first();

        if ($this->user->isBranchHead()) {
            $requestData = [
                'td_note_bh'        => $request->td_note_bh,
                'appTBranchHead'    => now()->format('n/j/Y, h:i:s A')
            ];
            $ticketApprovedData['approveHead'] = $this->user->login_id;
            $ticketApprovedData['displayTicket'] = $automationManager->login_id;
        } else {
            $requestData = [
                'td_note'           => $request->td_note,
            ];
            $ticketApprovedData['displayTicket'] = $ticketDetail->ticket->assignedPerson->login_id;
        }
        $ticketDetail->update($requestData);

        $ticketDetail->ticket->update($ticketApprovedData);

        $ticketDetail->ticket->userLogin->notify(new TicketNotification(
            "Hello, your ticket {$ticketDetail->ticket->ticket_code} has been approved",
            $ticketDetail->ticket->ticket_code,
            $this->user->userDetail->profile_pic,
            $this->user->full_name,
            $ticketDetail->ticket->userLogin->login_id
        ));

        $ticketDetail->ticket->pendingUser->notify(new TicketNotification(
            "New ticket from {$ticketDetail->ticket->branch->b_name} - ({$ticketDetail->ticket->branch->b_code})",
            $ticketDetail->ticket->ticket_code,
            $this->user->userDetail->profile_pic,
            $this->user->full_name,
            $ticketDetail->ticket->pendingUser->login_id
        ));

        return $ticketDetail;
    }

    public function markAsEdited($id, $request)
    {
        $ticketDetail = TicketDetail::findOrFail($id);

        $ticketApprovedData = [
            'last_approver'     => $this->user->login_id,
        ];

        $requestData = [
            'td_note'           => $request->td_note,
            'date_completed'    => now(),
            'time'              => now()->format('h:i:s A'),
        ];

        $ticketApprovedData['displayTicket'] = null;
        $ticketApprovedData['edited_by'] = $this->user->login_id;
        $ticketApprovedData['status'] = TicketStatus::EDITED;
        $ticketApprovedData['isCounted'] = $request->is_counted;
        $ticketApprovedData['appTEdited'] = now()->format('n/j/Y, h:i:s A');

        $ticketDetail->update($requestData);

        $ticketDetail->ticket->update($ticketApprovedData);

        $ticketDetail->ticket->userLogin->notify(new TicketNotification(
            "Hello, your ticket {$ticketDetail->ticket->ticket_code} has been edited",
            $ticketDetail->ticket->ticket_code,
            $this->user->userDetail->profile_pic,
            $this->user->full_name,
            $ticketDetail->ticket->userLogin->login_id
        ));

        return $ticketDetail;
    }

    public function returnToAutomation($ticketCode)
    {
        $ticket = Ticket::where('ticket_code', $ticketCode)->first();

        $ticket->update([
            'status'            => TicketStatus::PENDING,
            'displayTicket'     => $ticket->assignedPerson->login_id
        ]);

        $ticket->pendingUser->notify(new TicketNotification(
            "New ticket returned to you from {$ticket->branch->b_name} - ({$ticket->branch->b_code})",
            $ticket->ticket_code,
            $this->user->userDetail->profile_pic,
            $this->user->full_name,
            $ticket->pendingUser->login_id
        ));

        return $ticket;
    }

    public function markedAsNotCountedOrCounted($ticketCode)
    {
        $ticket = Ticket::where('ticket_code', $ticketCode)->first();

        $ticket->update([
            'isCounted'         => $ticket->isCounted === 1 ? 0 : 1
        ]);

        return $ticket;
    }

    public function editNote($request, $ticketCode)
    {
        $ticket = Ticket::where('ticket_code', $ticketCode)->first();

        $old_note = $ticket->ticketDetail->td_note;

        $ticket->ticketDetail->update([
            'td_note'           => $request->note
        ]);

        $new_note = $ticket->ticketDetail->td_note;

        return [
            $old_note,
            $new_note,
            $ticket->ticket_code
        ];
    }
}
