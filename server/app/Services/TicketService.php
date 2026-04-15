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
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class TicketService
{
    public function __construct(protected $user = null)
    {
        $this->user = Auth::user();
    }

    private function branchHeads()
    {
        $ids = explode(',', Auth::user()->blist_id);

        return UserLogin::query()
            ->where(function ($query) use ($ids) {
                $query->whereRelation('userRole', 'role_name', UserRoles::BRANCH_HEAD)
                    ->whereNot('login_id', Auth::id())
                    ->where(function ($sQ) use ($ids) {
                        foreach ($ids as $id) {
                            $sQ->orWhereRaw('FIND_IN_SET(?, blist_id)', [$id]);
                        }
                    });
            })
            ->count();
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
            'userLogin.userDetail',
            'pendingUser.userDetail'
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
            'ticketDetail:ticket_details_id,ticket_transaction_date,ticket_category_id,ticket_type',
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

        $branchId = $user->hasMultipleBranches() ? $request->ticket_for : $user->blist_id;

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
            ->whereRaw("FIND_IN_SET(?, blist_id)", [$branchId])
            ->first();

        if (!$assignedBranchHead) {
            return abort(400, 'No branch head assigned to your branch. Please contact your administrator.');
        }

        $assignedAccountingStaff = UserLogin::query()
            ->with('assignedCategories.categoryGroupCode.ticketCategories')
            ->has('assignedCategories')
            ->whereRelation(
                'userRole',
                'role_name',
                UserRoles::ACCOUNTING_STAFF
            )
            ->whereRelation(
                'assignedCategories.categoryGroupCode.ticketCategories',
                'ticket_category_id',
                $request->ticket_category
            )
            ->whereHas(
                'accountingAssignedBranches',
                fn($query)
                =>
                $query->where('assigned_accounting_branches.blist_id', $user->hasMultipleBranches() ? $request->ticket_for : $user->blist_id)
            )
            ->first();

        $assignedAccountingHead = UserLogin::query()
            ->has('assignedCategories')
            ->whereHas(
                'userRole',
                fn($accounting)
                =>
                $accounting->where('role_name', UserRoles::ACCOUNTING_HEAD)
            )
            ->whereRelation(
                'assignedCategories.categoryGroupCode.ticketCategories',
                'ticket_category_id',
                $request->ticket_category
            )
            ->first();

        $transactionDate = Carbon::parse($request->ticket_transaction_date)->startOfDay();

        $oneMonthAgo = Carbon::now()->subMonth()->startOfDay();

        $isLastMonth = $transactionDate->lte($oneMonthAgo);

        $isSql = $request->ticket_type === 'sql_ticket';

        $directToAccounting = $isLastMonth && $isSql && $assignedAccountingStaff;

        $data = DB::transaction(
            function () use ($request, $user, $assignedAutomation, $automationAdmin, $automationManager, $assignedBranchHead, $assignedAccountingStaff, $assignedAccountingHead, $directToAccounting) {
                $paths = [];
                $file = $request->file('ticket_support');
                $branch = BranchList::find($request->ticket_for);

                foreach ($file as $f) {
                    $fileName =  time() . '-' . $f->getClientOriginalName();
                    $paths[] = $f->storeAs('uploads', $fileName, 'public');
                }

                $ticketDetail = TicketDetail::create([
                    'ticket_type'               => $request->ticket_type,
                    'ticket_category_id'        => $request->ticket_category,
                    'sub_category_id'           => $request->ticket_sub_category,
                    'ticket_transaction_date'   => $request->ticket_transaction_date,
                    'td_support'                => $paths,
                    'date_created'              => now(),
                    'time'                      => now()->format('h:i:s A'),
                    'td_purpose'                => $request->purpose,
                    'td_from'                   => $request->from,
                    'td_to'                     => $request->to,
                    'td_ref_number'             => $request->ticket_reference_number
                ]);

                do {
                    $code = rand(100000, 999999);
                } while (
                    Ticket::query()
                    ->where('ticket_code', $code)
                    ->exists()
                );

                $ticketToBeDisplay = match (true) {
                    $user->isStaff()                                => $this->branchHeads() > 1 ? $request->branch_head_id : $assignedBranchHead->login_id,
                    $user->isBranchHead() && $directToAccounting    => $assignedAccountingStaff->login_id,
                    $user->isBranchHead()                           => $automationManager->login_id,
                    $user->isAccountingStaff()                      => $assignedAccountingHead->login_id,
                    $assignedAutomation                             => $assignedAutomation->assignedAutomation->login_id,
                    default                                         => $automationAdmin->login_id
                };

                $assignedPerson = match (true) {
                    $assignedAutomation?->exists()  => $assignedAutomation->assignedAutomation->login_id,
                    default                         => $automationAdmin->login_id,
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

        activity()
            ->causedBy(Auth::user())
            ->performedOn($data)
            ->log("Created a ticket");

        return $data;
    }


    public function updateTicket($request, $id)
    {
        $assignedBranchHead = UserLogin::query()
            ->whereHas(
                'userRole',
                fn($query)
                =>
                $query->where('role_name', UserRoles::BRANCH_HEAD)
            )
            ->whereRaw("FIND_IN_SET(?, blist_id)", [Auth::user()->blist_id])
            ->first();

        $data = DB::transaction(
            function () use ($request, $id, $assignedBranchHead) {

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
                        'ticket_support.*'           => ['file', 'max:5120'],
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
                    'ticket_type'               => $request->ticket_type,
                    'ticket_category_id'        => $request->ticket_category,
                    'sub_category_id'           => $request->ticket_sub_category,
                    'ticket_transaction_date'   => $request->ticket_transaction_date,
                    'td_support'                => $newPaths,
                    'td_purpose'                => $request->purpose,
                    'td_from'                   => $request->from,
                    'td_to'                     => $request->to,
                    'td_ref_number'             => $request->ticket_reference_number,
                ]);

                $to_update = [
                    'status'                    => TicketStatus::PENDING,
                ];

                if ($ticketDetail->ticket->pendingUser->isBranchHead()) {
                    $to_update['displayTicket'] = $this->branchHeads() > 1 ? $request->branch_head_id : $assignedBranchHead->login_id;
                }

                $ticketDetail->ticket->update($to_update);

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

        activity()
            ->causedBy(Auth::user())
            ->performedOn($data)
            ->log("Updated a ticket");

        return $data;
    }

    public function deleteTicket($id)
    {
        $ticketDetail = TicketDetail::findOrFail($id);

        if ($ticketDetail->ticket->status === TicketStatus::EDITED) {
            abort(400, 'You can not delete this ticket because it has been edited');
        }

        DeleteTicketEvent::dispatch($ticketDetail->ticket->ticket_code);

        foreach ($ticketDetail->td_support as $support) {
            if (Storage::disk('public')->exists($support)) {
                Storage::disk('public')->delete($support);
            }
        }

        $ticketDetail->ticket->delete();

        $ticketDetail->delete();

        DatabaseNotification::query()
            ->where('data->ticket_code', $ticketDetail->ticket->ticket_code)
            ->delete();

        activity()
            ->causedBy(Auth::user())
            ->performedOn($ticketDetail->ticket)
            ->log("Deleted a ticket");

        return $ticketDetail;
    }

    public function reviseTicket($id, $request)
    {
        $ticketDetail = TicketDetail::findOrFail($id);

        $note_data = match (true) {
            $this->user->isAutomation()        => ['td_note_bh'         => $request->td_note_bh],
            $this->user->isAutomationManager() => ['td_note'            => $request->td_note],
            $this->user->isAccountingStaff()   => ['td_note_accounting' => $request->td_note_accounting],
        };

        $ticketDetail->update($note_data);

        $ticketDetail->ticket->update([
            'status'        => TicketStatus::REJECTED
        ]);

        $this->readNotificationOnAction($ticketDetail->ticket->ticket_code);

        $ticketDetail->ticket->userLogin->notify(new TicketNotification(
            "Hello, your ticket {$ticketDetail->ticketCategory?->category_name} has been rejected",
            $ticketDetail->ticket->ticket_code,
            $this->user->userDetail->profile_pic,
            $this->user->full_name,
            $ticketDetail->ticket->userLogin->login_id
        ));

        activity()
            ->causedBy(Auth::user())
            ->performedOn($ticketDetail->ticket)
            ->log("Revised a ticket");

        return $ticketDetail;
    }

    public function approveTicket($id, $request)
    {
        $data = DB::transaction(function () use ($id, $request) {

            $ticketDetail = TicketDetail::findOrFail($id);

            $ticketApprovedData = [
                'last_approver' => $this->user->login_id,
            ];

            $automationManager = UserLogin::query()
                ->whereHas(
                    'userRole',
                    fn($query)
                    =>
                    $query->where('role_name', UserRoles::AUTOMATION_MANAGER)
                )
                ->first();

            $accountingHead = UserLogin::query()
                ->where(
                    fn($query)
                    =>
                    $query
                        ->whereRelation('userRole', 'role_name', UserRoles::ACCOUNTING_HEAD)
                        ->whereRelation(
                            'assignedCategories',
                            fn($category)
                            =>
                            $category->where('group_code', $ticketDetail->ticketCategory->group_code)
                        )
                )
                ->first();

            $accountingStaff = UserLogin::query()
                ->where(
                    fn($query)
                    =>
                    $query
                        ->whereRelation('userRole', 'role_name', UserRoles::ACCOUNTING_STAFF)
                        ->whereRelation(
                            'assignedCategories',
                            fn($category)
                            =>
                            $category->where('group_code', $ticketDetail->ticketCategory->group_code)
                        )
                    // ->whereHas(
                    //     'accountingAssignedBranches',
                    //     fn($query)
                    //     =>
                    //     $query->where('assigned_accounting_branches.blist_id', $ticketDetail->ticket->branch_id)
                    // )
                )
                ->first();

            $transactionDate = Carbon::parse($ticketDetail->ticket_transaction_date)->startOfDay();

            $oneMonthAgo = Carbon::now()->subMonth()->startOfDay();

            $isLastMonth = $transactionDate->lte($oneMonthAgo);

            $isSql = $ticketDetail->ticket_type === 'sql_ticket';

            $directToAccounting = $isLastMonth && $isSql && $accountingStaff;

            $errorForNoBranchesOrAccountingStaff = $isLastMonth && $isSql && !$accountingStaff;

            if ($errorForNoBranchesOrAccountingStaff && $this->user->isBranchHead()) {
                abort(400, 'No assigned accounting staff for this branch and category.');
            }

            $requestData = [];

            if ($this->user->isBranchHead() && $directToAccounting) {
                $ticketApprovedData['approveHead'] = $this->user?->login_id;
                $ticketApprovedData['displayTicket'] = $accountingStaff->login_id;
                $ticketApprovedData['appTBranchHead'] = now()->format('n/j/Y, h:i:s A');
            } elseif ($this->user->isBranchHead()) {
                $ticketApprovedData['approveHead'] = $this->user?->login_id;
                $ticketApprovedData['displayTicket'] = $automationManager?->login_id;
                $ticketApprovedData['appTBranchHead'] = now()->format('n/j/Y, h:i:s A');
            } elseif ($this->user->isAccountingStaff()) {
                $ticketApprovedData['displayTicket'] = $accountingHead?->login_id ?? $automationManager?->login_id;
            } elseif ($this->user->isAccountingHead()) {
                $ticketApprovedData['displayTicket'] = $automationManager?->login_id;
            } else {
                if ($this->user->isAutomation()) {
                    $requestData = [
                        'td_note_bh' => $request->td_note_bh,
                    ];
                } else {

                    $requestData = [
                        'td_note'    => $request->td_note,
                    ];
                }
                $ticketApprovedData['displayTicket'] = $ticketDetail->ticket->assignedPerson?->login_id;
            }

            $ticketDetail->update($requestData);

            $ticketDetail->ticket->update($ticketApprovedData);

            $this->readNotificationOnAction($ticketDetail->ticket->ticket_code);

            $ticketDetail->ticket->userLogin->notify(new TicketNotification(
                "Hello, your ticket {$ticketDetail->ticketCategory?->category_name} has been approved",
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
        });

        activity()
            ->causedBy(Auth::user())
            ->performedOn($data->ticket)
            ->log("Approved a ticket");

        return $data;
    }

    public function markAsEdited($id, $request)
    {
        $data = DB::transaction(function () use ($id, $request) {
            $ticketDetail = TicketDetail::findOrFail($id);

            $ticketApprovedData = [
                'last_approver'     => $this->user->login_id,
            ];

            $requestData = [
                'td_note_bh'        => $request->td_note_bh,
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

            $this->readNotificationOnAction($ticketDetail->ticket->ticket_code);

            $ticketDetail->ticket->userLogin->notify(new TicketNotification(
                "Hello, your ticket {$ticketDetail->ticketCategory?->category_name} has been edited",
                $ticketDetail->ticket->ticket_code,
                $this->user->userDetail->profile_pic,
                $this->user->full_name,
                $ticketDetail->ticket->userLogin->login_id
            ));

            return $ticketDetail;
        });

        activity()
            ->causedBy(Auth::user())
            ->performedOn($data->ticket)
            ->log("Mark as edited a ticket");

        return $data;
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

        activity()
            ->causedBy(Auth::user())
            ->performedOn($ticket)
            ->log("Returned a ticket to automation on reports");

        return $ticket;
    }

    public function markedAsNotCountedOrCounted($ticketCode)
    {
        $ticket = Ticket::where('ticket_code', $ticketCode)->first();

        $ticket->update([
            'isCounted'         => $ticket->isCounted === 1 ? 0 : 1
        ]);

        activity()
            ->causedBy(Auth::user())
            ->performedOn($ticket)
            ->log("Marked a ticket to counted or not counted on reports");

        return $ticket;
    }

    public function editNote($request, $ticketCode)
    {
        $ticket = Ticket::query()
            ->where('ticket_code', $ticketCode)
            ->first();

        $old_note = $ticket->ticketDetail->td_note_bh;

        $ticket->ticketDetail->update([
            'td_note_bh'           => $request->note
        ]);

        $new_note = $ticket->ticketDetail->td_note_bh;

        activity()
            ->causedBy(Auth::user())
            ->performedOn($ticket)
            ->log("Edited a note ticket on reports");

        return [
            $old_note,
            $new_note,
            $ticket->ticket_code
        ];
    }

    private function readNotificationOnAction($ticket_code)
    {
        return $this->user->notifications()
            ->where('data->ticket_code', $ticket_code)
            ->update([
                'read_at' => now()
            ]);
    }

    public function downloadZip($ticket_detail_id)
    {
        $files = TicketDetail::where('ticket_details_id', $ticket_detail_id)
            ->first()?->td_support;

        $zipFileName = 'attachments.zip';
        $zipPath = storage_path("app/temp/{$zipFileName}");

        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $zip = new ZipArchive;

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
            foreach ($files as $file) {
                $storageFile = storage_path('app/public/' . $file);
                if (file_exists($storageFile)) {
                    $zip->addFile($storageFile, basename($storageFile));
                }
            }
            $zip->close();
        }

        return $zipPath;
    }
}
