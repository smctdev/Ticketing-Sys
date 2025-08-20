<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Models\BranchList;
use App\Models\Ticket;
use Illuminate\Pagination\LengthAwarePaginator;
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
        $branchCode,
        $ticketCategory,
        $branchCategory,
        $currentPage
    ) {
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
                $edited_start_date
                    &&
                    $edited_end_date,
                fn($query)
                =>
                $query->whereHas(
                    'ticketDetail',
                    fn($subQuery)
                    =>
                    $subQuery->whereBetween('date_completed', [$edited_start_date, $edited_end_date])
                        ->orWhereBetween('date_completed', [$edited_end_date, $edited_start_date])
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
                    $subQuery->whereBetween('ticket_transaction_date', [$edited_transaction_start_date, $edited_transaction_end_date])
                        ->orWhereBetween('ticket_transaction_date', [$edited_transaction_end_date, $edited_transaction_start_date])
                )
            )
            ->when($branchCode !== "ALL", fn($query) => $query->where('branch_id', $branchCode))
            ->when($ticketCategory !== "ALL", fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticketCategory)))
            ->when($branchCategory !== "ALL", fn($query) => $query->whereHas('branch', fn($subQuery) => $subQuery->where('category', $branchCategory)))
            ->whereHas('ticketDetail', fn($query) => $query->whereNotNull('date_completed')
                ->where('date_completed', '!=', ''))
            ->when($userRole->role_name !== UserRoles::ADMIN, function ($query) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                $query->where(function ($subQuery) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                    switch ($userRole->role_name) {
                        case UserRoles::STAFF:
                            $subQuery->where('login_id', Auth::id());
                            break;
                        case UserRoles::AUTOMATION:
                            $subQuery->where(
                                fn($q)
                                =>
                                $q->whereHas('editedBy')
                                    ->orWhereHas('assignedTicket')
                            )
                                ->where('status', TicketStatus::EDITED)
                                ->whereIn('branch_id', $automationBranches);
                            break;
                        case UserRoles::BRANCH_HEAD:
                            $subQuery->where('branch_id', $user->blist_id);
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
                                ->orWhere('branch_id', $user->blist_id);
                            break;
                    }
                });
            })
            ->where('status', TicketStatus::EDITED)
            ->orderBy(
                BranchList::select('category')
                    ->whereColumn('branch_lists.blist_id', 'tickets.branch_id')
                    ->limit(1)
            )
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
        $branchCode,
        $ticketCategory,
        $branchCategory,
    ) {
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
            'approveHead',
            'approveAutm',
            'branch',
            'approveAcctgSup',
            'approveAcctgStaff',
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
                    $subQuery->whereBetween('date_completed', [$edited_start_date, $edited_end_date])
                        ->orWhereBetween('date_completed', [$edited_end_date, $edited_start_date])
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
                    $subQuery->whereBetween('ticket_transaction_date', [$edited_transaction_start_date, $edited_transaction_end_date])
                        ->orWhereBetween('ticket_transaction_date', [$edited_transaction_end_date, $edited_transaction_start_date])
                )
            )
            ->when($branchCode !== "ALL", fn($query) => $query->where('branch_id', $branchCode))
            ->when($ticketCategory !== "ALL", fn($query) => $query->whereHas('ticketDetail', fn($subQuery) => $subQuery->where('ticket_category_id', $ticketCategory)))
            ->when($branchCategory !== "ALL", fn($query) => $query->whereHas('branch', fn($subQuery) => $subQuery->where('category', $branchCategory)))
            ->whereHas('ticketDetail', fn($query) => $query->whereNotNull('date_completed')
                ->where('date_completed', '!=', ''))
            ->when($userRole->role_name !== UserRoles::ADMIN, function ($query) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                $query->where(function ($subQuery) use ($userRole, $automationBranches, $assignedBranchCas, $assignedAreaManagers, $accountingHeadCodes, $user) {
                    switch ($userRole->role_name) {
                        case UserRoles::STAFF:
                            $subQuery->where('login_id', Auth::id());
                            break;
                        case UserRoles::AUTOMATION:
                            $subQuery->where(
                                fn($q)
                                =>
                                $q->whereHas('editedBy')
                                    ->orWhereHas('assignedTicket')
                            )
                                ->where('status', TicketStatus::EDITED)
                                ->whereIn('branch_id', $automationBranches);
                            break;
                        case UserRoles::BRANCH_HEAD:
                            $subQuery->where('branch_id', $user->blist_id);
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
                                ->orWhere('branch_id', $user->blist_id);
                            break;
                    }
                });
            })
            ->where('status', TicketStatus::EDITED)
            ->orderBy(
                BranchList::select('category')
                    ->whereColumn('branch_lists.blist_id', 'tickets.branch_id')
            )
            ->get();

        $grouped = $tickets->groupBy(fn($item) => implode('|', [
            $item->branch_name,
            $item->branch->b_code,
        ]))->map(function ($group) {
            $first = $group->first();
            return [
                'branch_name'                   => $first->branch_name,
                'ticket_count'                  => $group->count(),
            ];
        })
            ->values();

        return [
            'totals'    => $grouped,
            'tickets'   => $tickets
        ];
    }
}
