<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\Supplier;
use App\Models\Ticket;
use App\Models\UserLogin;
use App\Services\TicketService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $data = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas('userRole', function ($query) {
                $query->where('role_name', 'Automation');
            })
            ->with('editedByAutomationTickets.ticketDetail.ticketCategory')
            ->withCount([
                'editedByAutomationTickets as ticketsThisMonth' => function ($query) {
                    $query->whereHas('ticketDetail', function ($subQuery) {
                        $subQuery->whereMonth('date_created', now()->month);
                    })->where('status', 'EDITED');
                },
                'editedByAutomationTickets as ticketsLastMonth' => function ($query) {
                    $query->whereHas('ticketDetail', function ($subQuery) {
                        $subQuery->whereMonth('date_created', now()->subMonth()->month);
                    })->where('status', 'EDITED');
                },
            ])
            ->get();

        return response()->json([

            'data'                      => $data->map(function ($user) {
                $categories = $user->editedByAutomationTickets
                    ->pluck('ticketDetail.ticketCategory')
                    ->filter()
                    ->pluck('id');
                $mostUsedCategoryId = $categories->countBy()->sortDesc()->keys()->first();

                $mostUsedCategory = $user->editedByAutomationTickets
                    ->pluck('ticketDetail.ticketCategory')
                    ->filter()
                    ->firstWhere('id', $mostUsedCategoryId);
                return [
                    'full_name'         => $user->full_name,
                    'profile_picture'   => $user->profile_picture,
                    'ticketsThisMonth'  => $user->ticketsThisMonth,
                    'ticketsLastMonth'  => $user->ticketsLastMonth,
                    'roundedPercentage' => $user->ticketsLastMonth === 0 ? 0 : ($user->ticketsThisMonth - $user->ticketsLastMonth) / $user->ticketsLastMonth * 100,
                    "mostUsedCategory"  => [
                        "category"      => $mostUsedCategory?->category_shortcut
                    ],
                    'result'            => $user->ticketsThisMonth > $user->ticketsLastMonth ? "High" : "Low",
                ];
            })
        ], 200);
    }

    private function userCount()
    {
        $total_users = UserLogin::where('login_id', '!=', Auth::id())
            ->count();

        $total_automation = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::AUTOMATION))
            ->count();

        $total_accounting_head = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::ACCOUNTING_HEAD))
            ->count();

        $total_branch_head = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::BRANCH_HEAD))
            ->count();

        $total_staff = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::STAFF))
            ->count();

        $total_cas = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::CAS))
            ->count();

        $total_accounting_staff = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::ACCOUNTING_STAFF))
            ->count();

        $total_area_manager = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas("userRole", fn($query) => $query->where('role_name', UserRoles::AREA_MANAGER))
            ->count();

        return [
            'total_users'               => $total_users,
            'total_automation'          => $total_automation,
            'total_accounting_head'     => $total_accounting_head,
            'total_branch_head'         => $total_branch_head,
            'total_staff'               => $total_staff,
            'total_cas'                 => $total_cas,
            'total_accounting_staff'    => $total_accounting_staff,
            'total_area_manager'        => $total_area_manager
        ];
    }

    private function ticketCompletedCount()
    {
        $ticketsThisMonth = Ticket::whereHas('ticketDetail', fn($query) => $query->whereMonth('date_completed', now()->month))
            ->count();

        $ticketsLastMonth = Ticket::whereHas('ticketDetail', fn($query) => $query->whereMonth('date_completed', now()->subMonth()->month))
            ->count();
        $percentageThanLastMonth = $ticketsLastMonth === 0 ? 0 : ($ticketsThisMonth - $ticketsLastMonth) / $ticketsLastMonth * 100;

        return [
            "tickets_this_month"              => $ticketsThisMonth,
            "tickets_last_month"              => $ticketsLastMonth,
            "tickets_percentage_this_month"   => number_format($percentageThanLastMonth, 2, ".", ",")
        ];
    }

    private function ticketThisWeekCount()
    {
        $ticketsThisWeek = Ticket::whereHas('ticketDetail', fn($query) => $query->whereBetween('date_completed', [now()->startOfWeek(), now()->endOfWeek()]))
            ->count();

        $ticketsLastWeek = Ticket::whereHas('ticketDetail', fn($query) => $query->whereBetween('date_completed', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()]))
            ->count();

        $percentageThanLastWeek = $ticketsLastWeek === 0 ? 0 : ($ticketsThisWeek - $ticketsLastWeek) / $ticketsLastWeek * 100;

        return [
            "tickets_this_week"                 => $ticketsThisWeek,
            "tickets_last_week"                 => $ticketsLastWeek,
            "tickets_percentage_this_week"      => number_format($percentageThanLastWeek, 2, ".", ",")
        ];
    }

    private function ticketsData()
    {
        $ticketsPending = Ticket::where('status', TicketStatus::PENDING)
            ->count();

        $ticketsRejected = Ticket::where('status', TicketStatus::REJECTED)
            ->count();

        $ticketsEdited = Ticket::where('status', TicketStatus::EDITED)
            ->count();

        return [
            "tickets_pending"   => $ticketsPending,
            "tickets_rejected"  => $ticketsRejected,
            "tickets_edited"    => $ticketsEdited
        ];
    }

    public function totalBranches()
    {
        return BranchList::count();
    }

    public function totalSuppliers()
    {
        return Supplier::count();
    }

    public function adminDashboardData()
    {

        return response()->json([
            "total_users"                           => $this->userCount(),
            "tickets_completed_this_month_data"     => $this->ticketCompletedCount(),
            "tickets_completed_this_week_data"      => $this->ticketThisWeekCount(),
            "tickets"                               => $this->ticketsData(),
            'branches'                              => $this->totalBranches(),
            'suppliers'                             => $this->totalSuppliers(),
            'automation_records'                    => $this->index()
        ], 200);
    }



    public function userDashboardData($ticketService)
    {

        return response()->json([
            "message"                   => "Dashboard data fetched successfully",
            "data"                      => $ticketService->getDashboardData(),
            "total_tickets"             => $ticketService->getTotalTickets(),
            "total_edited_tickets"      => $ticketService->getTotalEditedTickets(),
            "total_rejected_tickets"    => $ticketService->getTotalRejectedTickets(),
            "total_pending_tickets"     => $ticketService->getTotalPendingTickets(),
            'recent_tickets'            => $ticketService->getRecentTickets(),
        ], 200);
    }

    public function dashboardData()
    {
        if (Auth::user()->isAdmin()) {
            return $this->adminDashboardData();
        } else {
            return $this->userDashboardData(new TicketService());
        }
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
