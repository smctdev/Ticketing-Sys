<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Models\BranchList;
use App\Models\Ticket;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class ReportsService
{
    public function getAllReports(
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
    ) {

        $assignedBranchCas = $user->assignedBranchCas->pluck('blist_id');

        $assignedAreaManagers = $user->assignedAreaManagers->pluck('blist_id');

        $accountingHeadCodes = $user->assignedCategories->pluck('group_code');

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
            'editedBy.userDetail',
            'editedBy.userRole',
            'editedBy.branch',
            'branch'
        )
            ->when(
                $ticket_type !== "ALL",
                fn($query)
                =>
                $query->whereRelation('ticketDetail', 'ticket_type', $ticket_type)
            )
            ->when(
                $search,
                fn($query)
                =>
                $query->whereHas(
                    'userLogin',
                    fn($user)
                    =>
                    $user->search($search)
                )
                    ->orWhere('ticket_code', 'LIKE', "%{$search}%")
            )
            ->when(
                $edited_start_date
                    &&
                    $edited_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [Carbon::parse($edited_start_date)->startOfDay(), Carbon::parse($edited_end_date)->endOfDay()])
                        ->orWhereBetween('date_completed', [Carbon::parse($edited_end_date)->endOfDay(), Carbon::parse($edited_start_date)->startOfDay()])
                )
            )
            ->when(
                $created_start_date
                    &&
                    $created_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [Carbon::parse($created_start_date)->startOfDay(), Carbon::parse($created_end_date)->endOfDay()])
                        ->orWhereBetween('date_completed', [Carbon::parse($created_end_date)->endOfDay(), Carbon::parse($created_start_date)->startOfDay()])
                )
            )
            ->when(
                $edited_transaction_start_date
                    &&
                    $edited_transaction_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [Carbon::parse($edited_transaction_start_date)->startOfDay(), Carbon::parse($edited_transaction_end_date)->endOfDay()])
                        ->orWhereBetween('date_completed', [Carbon::parse($edited_transaction_end_date)->endOfDay(), Carbon::parse($edited_transaction_start_date)->startOfDay()])
                )
            )
            ->when($branchCode !== "ALL", fn($query) => $query->whereIn('branch_id', explode(",", $branchCode)))
            ->when($ticketCategory !== "ALL", fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticketCategory)))
            ->when($branchCategory !== "ALL", fn($query) => $query->whereHas('branch', fn($subQuery) => $subQuery->where('category', $branchCategory)))
            ->whereHas('ticketDetail', fn($query) => $query->whereNotNull('date_completed')
                ->where('date_completed', '!=', ''))
            ->when(!$user->isSuperAdmin() || !$user->isAdmin() || !$user->isAutomationAdmin() || !$user->isAutomationManager() || !$user->isAudit(), function ($query) use ($userRole, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                $query->where(function ($subQuery) use ($userRole, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                    $userBranchIds = explode(',', $user->blist_id);

                    switch ($userRole->role_name) {
                        case UserRoles::STAFF:
                            $subQuery->where('login_id', Auth::id());
                            break;
                        case UserRoles::AUTOMATION:
                            $subQuery->where('assigned_person', $user->login_id);
                            break;
                        case UserRoles::BRANCH_HEAD:
                            $subQuery->whereIn('branch_id', $userBranchIds);
                            break;
                        case UserRoles::CAS:
                            $subQuery->whereIn('branch_id', $assignedBranchCas);
                            break;
                        case UserRoles::AREA_MANAGER:
                            $subQuery->whereIn('branch_id', $assignedAreaManagers);
                            break;
                        case UserRoles::ACCOUNTING_HEAD:
                            $subQuery->whereHas('ticketDetail', fn($triQuery) => $triQuery->whereHas('ticketCategory', fn($ticketQuery) => $ticketQuery->whereIn('group_code', $accountingHeadCodes)));
                            break;
                        case UserRoles::ACCOUNTING_STAFF:
                            $subQuery->where('login_id', Auth::id())
                                ->orWhereHas('ticketDetail', fn($triQuery) => $triQuery->whereHas('ticketCategory', fn($ticketQuery) => $ticketQuery->whereIn('group_code', $accountingHeadCodes)));
                            break;
                    }
                });
            })
            ->whereIn('status', [TicketStatus::EDITED, TicketStatus::REJECTED])
            ->orderBy('branch_name')
            ->get();

        $grouped = $tickets->groupBy(fn($item) => implode('|', [
            $item->branch_name,
            $item->isCounted,
            $item->branch->b_code,
            $item->branch->category,
            $item->ticketDetail->ticketCategory->category_name,
            $item->ticketDetail->ticketCategory->category_shortcut,
        ]))->map(function ($group) {
            $first = $group->first();
            return [
                'tickets'                       => $group,
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
        })
            ->values();

        $items = $grouped->forPage($currentPage, $take);

        $paginated = new LengthAwarePaginator(
            $items->values(),
            $grouped->count(),
            $take,
            $currentPage
        );

        return $paginated;
    }

    public function exportReports(
        $user,
        $userRole,
        $edited_start_date,
        $edited_end_date,
        $edited_transaction_start_date,
        $edited_transaction_end_date,
        $created_start_date,
        $created_end_date,
        $branchCode,
        $ticketCategory,
        $branchCategory,
        $search,
        $ticket_type
    ) {

        $assignedBranchCas = $user->assignedBranchCas->pluck('blist_id');

        $assignedAreaManagers = $user->assignedAreaManagers->pluck('blist_id');

        $accountingHeadCodes = $user->assignedCategories->pluck('group_code');

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
            'editedBy.userDetail',
            'editedBy.userRole',
            'editedBy.branch',
            'branch',
        )
            ->when(
                $ticket_type !== "ALL",
                fn($query)
                =>
                $query->whereRelation('ticketDetail', 'ticket_type', $ticket_type)
            )
            ->when(
                $search,
                fn($query)
                =>
                $query->whereHas(
                    'userLogin',
                    fn($user)
                    =>
                    $user->search($search)
                )
                    ->orWhere('ticket_code', 'LIKE', "%{$search}%")
            )
            ->when(
                $edited_start_date
                    &&
                    $edited_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [Carbon::parse($edited_start_date)->startOfDay(), Carbon::parse($edited_end_date)->endOfDay()])
                        ->orWhereBetween('date_completed', [Carbon::parse($edited_end_date)->endOfDay(), Carbon::parse($edited_start_date)->startOfDay()])
                )
            )
            ->when(
                $created_start_date
                    &&
                    $created_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [Carbon::parse($created_start_date)->startOfDay(), Carbon::parse($created_end_date)->endOfDay()])
                        ->orWhereBetween('date_completed', [Carbon::parse($created_end_date)->endOfDay(), Carbon::parse($created_start_date)->startOfDay()])
                )
            )
            ->when(
                $edited_transaction_start_date
                    &&
                    $edited_transaction_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [Carbon::parse($edited_transaction_start_date)->startOfDay(), Carbon::parse($edited_transaction_end_date)->endOfDay()])
                        ->orWhereBetween('date_completed', [Carbon::parse($edited_transaction_end_date)->endOfDay(), Carbon::parse($edited_transaction_start_date)->startOfDay()])
                )
            )
            ->when($branchCode !== "ALL", fn($query) => $query->whereIn('branch_id', explode(",", $branchCode)))
            ->when($ticketCategory !== "ALL", fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticketCategory)))
            ->when($branchCategory !== "ALL", fn($query) => $query->whereHas('branch', fn($subQuery) => $subQuery->where('category', $branchCategory)))
            ->whereHas('ticketDetail', fn($query) => $query->whereNotNull('date_completed')
                ->where('date_completed', '!=', ''))
            ->when(!$user->isSuperAdmin() || !$user->isAdmin() || !$user->isAutomationAdmin() || !$user->isAutomationManager() || !$user->isAudit(), function ($query) use ($userRole, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                $query->where(function ($subQuery) use ($userRole, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                    $userBranchIds = explode(',', $user->blist_id);
                    switch ($userRole->role_name) {
                        case UserRoles::STAFF:
                            $subQuery->where('login_id', Auth::id());
                            break;
                        case UserRoles::AUTOMATION:
                            $subQuery->whereAny(
                                [
                                    'assigned_person',
                                    'edited_by'
                                ],
                                $user->login_id
                            );
                            break;
                        case UserRoles::BRANCH_HEAD:
                            $subQuery->whereIn('branch_id', $userBranchIds);
                            break;
                        case UserRoles::CAS:
                            $subQuery->whereIn('branch_id', $assignedBranchCas);
                            break;
                        case UserRoles::AREA_MANAGER:
                            $subQuery->whereIn('branch_id', $assignedAreaManagers);
                            break;
                        case UserRoles::ACCOUNTING_HEAD:
                            $subQuery->whereHas('ticketDetail', fn($triQuery) => $triQuery->whereHas('ticketCategory', fn($ticketQuery) => $ticketQuery->whereIn('group_code', $accountingHeadCodes)));
                            break;
                        case UserRoles::ACCOUNTING_STAFF:
                            $subQuery->where('login_id', Auth::id())
                                ->orWhereHas('ticketDetail', fn($triQuery) => $triQuery->whereHas('ticketCategory', fn($ticketQuery) => $ticketQuery->whereIn('group_code', $accountingHeadCodes)));
                            break;
                    }
                });
            })
            ->where('status', TicketStatus::EDITED)
            ->orderBy('branch_name')
            ->where('isCounted', 0)
            ->get();

        $grouped = $tickets->groupBy(fn($item) => implode('|', [
            $item->branch_name,
            $item->branch->b_code,
        ]))->map(function ($group) {
            $first = $group->first();

            $allTicketDetails = $group->pluck('ticketDetail')->flatten();

            $groupedTicketDetail  = $allTicketDetails->groupBy('ticket_category_id')->map(function ($group) {
                $allSubCategories = $group->pluck('subCategory')->flatten();

                $groupedSubCategory = $allSubCategories->groupBy('sub_category_name')->map(function ($group) {
                    if (!$group->first()?->sub_category_name) {
                        return null;
                    }
                    return [
                        'sub_category_name'  => $group->first()?->sub_category_name,
                        'sub_category_count' => $group->count()
                    ];
                })->values();

                return [
                    'ticket_category_name'  => $group->first()?->ticketCategory?->category_name,
                    'ticket_category_count' => $group->count(),
                    'sub_category_items'    => !$groupedSubCategory[0] ? [] : $groupedSubCategory
                ];
            })->values();

            return [
                'branch_name'           => $first->branch_name,
                'ticket_count'          => $group->count(),
                'ticket_category_items' => $groupedTicketDetail
            ];
        })
            ->values();

        activity()
            ->causedBy(Auth::user())
            ->log("Exported a ticket");

        return [
            'totals'    => $grouped,
            'tickets'   => $tickets
        ];
    }
}
