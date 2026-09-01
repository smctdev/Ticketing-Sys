<?php

namespace App\Http\Controllers\Api;

use App\Enums\TicketStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\Supplier;
use App\Models\Ticket;
use App\Models\UserLogin;
use App\Models\UserRole;
use App\Services\AutomationDashboardService;
use App\Services\TicketService;
use Illuminate\Container\Attributes\CurrentUser;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function __construct(#[CurrentUser] public ?UserLogin $user, public ?Ticket $tickets) {}

    public function index()
    {

        $data = UserLogin::with('userDetail')
            ->where('login_id', '!=', Auth::id())
            ->whereHas('userRole', function ($query) {
                $query->where('role_name', 'Automation');
            })
            ->with('editedByAutomationTickets.ticketDetail.ticketCategory')
            ->withCount([
                'editedByAutomationTickets as ticketsThisMonth' => function ($query) {
                    $query->whereHas('ticketDetail', function ($subQuery) {
                        $subQuery->whereMonth('date_created', now()->month);
                    })
                        ->where('status', TicketStatus::EDITED);
                },
                'editedByAutomationTickets as ticketsLastMonth' => function ($query) {
                    $query->whereHas('ticketDetail', function ($subQuery) {
                        $subQuery->whereMonth('date_created', now()->subMonth()->month);
                    })
                        ->where('status', TicketStatus::EDITED);
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
                    'profile_picture'   => $user?->userDetail?->profile_pic,
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
        $total_users = UserLogin::query()
            ->where('login_id', '!=', Auth::id())
            ->count();

        $user_counts = UserLogin::query()
            ->where('login_id', '!=', Auth::id())
            ->join('user_roles', 'user_logins.user_role_id', '=', 'user_roles.user_role_id')
            ->select('user_roles.role_name', DB::raw('COUNT(*) as total'))
            ->groupBy('user_roles.role_name')
            ->pluck('total', 'role_name')
            ->toArray();

        return [
            'total_users'            => $total_users,
            'total_automation'       => (int) ($user_counts[UserRoles::AUTOMATION?->value] ?? 0),
            'total_accounting_head'  => (int) ($user_counts[UserRoles::ACCOUNTING_HEAD?->value] ?? 0),
            'total_branch_head'      => (int) ($user_counts[UserRoles::BRANCH_HEAD?->value] ?? 0),
            'total_staff'            => (int) ($user_counts[UserRoles::STAFF?->value] ?? 0),
            'total_cas'              => (int) ($user_counts[UserRoles::CAS?->value] ?? 0),
            'total_accounting_staff' => (int) ($user_counts[UserRoles::ACCOUNTING_STAFF?->value] ?? 0),
            'total_area_manager'     => (int) ($user_counts[UserRoles::AREA_MANAGER?->value] ?? 0)
        ];
    }

    private function ticketCompletedCount()
    {
        $ticketsThisMonth = (clone $this->tickets)
            ->whereHas(
                'ticketDetail',
                fn($query)
                =>
                $query->whereMonth('date_completed', now()->month)
            )
            ->count();

        $ticketsLastMonth = (clone $this->tickets)
            ->whereHas(
                'ticketDetail',
                fn($query)
                =>
                $query->whereMonth('date_completed', now()->subMonth()->month)
            )
            ->count();
        $percentageThanLastMonth = $ticketsLastMonth === 0 ? 0 : ($ticketsThisMonth - $ticketsLastMonth) / $ticketsLastMonth * 100;

        return [
            "tickets_this_month"            => $ticketsThisMonth,
            "tickets_last_month"            => $ticketsLastMonth,
            "tickets_percentage_this_month" => number_format($percentageThanLastMonth, 2, ".", ",")
        ];
    }

    private function ticketThisWeekCount()
    {
        $ticketsThisWeek = (clone $this->tickets)
            ->whereHas(
                'ticketDetail',
                fn($query)
                =>
                $query->whereBetween('date_completed', [now()->startOfWeek(), now()->endOfWeek()])
            )
            ->count();

        $ticketsLastWeek = (clone $this->tickets)
            ->whereHas(
                'ticketDetail',
                fn($query)
                =>
                $query->whereBetween('date_completed', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])
            )
            ->count();

        $percentageThanLastWeek = $ticketsLastWeek === 0 ? 0 : ($ticketsThisWeek - $ticketsLastWeek) / $ticketsLastWeek * 100;

        return [
            "tickets_this_week"            => $ticketsThisWeek,
            "tickets_last_week"            => $ticketsLastWeek,
            "tickets_percentage_this_week" => number_format($percentageThanLastWeek, 2, ".", ",")
        ];
    }

    private function ticketsData()
    {
        $overallTickets = (clone $this->tickets)
            ->count();

        $ticket_counts = (clone $this->tickets)
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            "overall_tickets"  => $overallTickets,
            "tickets_pending"  => (int) ($ticket_counts[TicketStatus::PENDING?->value] ?? 0),
            "tickets_rejected" => (int) ($ticket_counts[TicketStatus::REJECTED?->value] ?? 0),
            "tickets_edited"   => (int) ($ticket_counts[TicketStatus::EDITED?->value] ?? 0)
        ];
    }

    public function totalBranches()
    {
        return BranchList::query()->count();
    }

    public function totalSuppliers()
    {
        return Supplier::query()->count();
    }

    public function adminDashboardData()
    {
        return response()->json([
            'data' => [
                "total_users"                       => $this->userCount(),
                "tickets_completed_this_month_data" => $this->ticketCompletedCount(),
                "tickets_completed_this_week_data"  => $this->ticketThisWeekCount(),
                "tickets"                           => $this->ticketsData(),
                'branches'                          => $this->totalBranches(),
                'suppliers'                         => $this->totalSuppliers(),
                'automation_records'                => $this->index()
            ]
        ], 200);
    }

    public function userDashboardData($ticketService)
    {
        return response()->json([
            "message"                    => "Dashboard data fetched successfully",
            "data"                       => [
                "data"                   => $ticketService->getDashboardData(),
                "total_tickets"          => $ticketService->getTotalTickets(),
                "total_edited_tickets"   => $ticketService->getTicketCounts('edited'),
                "total_rejected_tickets" => $ticketService->getTicketCounts('rejected'),
                "total_pending_tickets"  => $ticketService->getTicketCounts('pending'),
                'recent_tickets'         => $ticketService->getRecentTickets(),

            ],
        ], 200);
    }

    public function automationDashboardData($ticketService)
    {
        return response()->json([
            'data'               => [
                'ticket_totals'  => $ticketService->ticketTotals(),
                'recent_tickets' => $ticketService->recentTicketRecordsData()
            ]
        ]);
    }

    public function dashboardData()
    {
        if ($this->user->isAdmin() || $this->user->isAutomationAdmin() || $this->user->isSuperAdmin() || $this->user->isAutomationManager()) {
            return $this->adminDashboardData();
        } elseif ($this->user->isAutomation()) {
            return $this->automationDashboardData(new AutomationDashboardService($this->user, $this->tickets));
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
