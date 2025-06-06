<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\UserLogin;
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
        $automationData = UserLogin::with('userRole', 'userDetail', 'branch')
            ->where("login_id", '!=', Auth::id())
            ->whereHas('userRole', function ($query) {
                $query->where('role_name', 'Automation');
            })
            ->get();

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
            'automation' => $automationData->map(fn($automation) => [
                'login_id'      => $automation->login_id,
                'UserDetails'   => $automation->userDetail,
                'UserRole'      => $automation->userRole,
                'Branch'        => $automation->branch
            ]),
            'data'       => $data->map(function ($user) {
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
        $userCount = UserLogin::where('login_id', '!=', Auth::id())
            ->whereHas('userRole', fn($query) => $query->where('role_name', 'Automation'))
            ->count();
        return $userCount;
    }

    private function ticketCompletedCount()
    {
        $ticketsThisMonth = Ticket::whereHas('ticketDetail', fn($query) => $query->whereMonth('date_created', now()->month)->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id())))
            ->count();
        $ticketsLastMonth = Ticket::whereHas('ticketDetail', fn($query) => $query->whereMonth('date_created', now()->subMonth()->month)->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id())))
            ->count();
        $percentageThanLastMonth = $ticketsLastMonth === 0 ? 0 : ($ticketsThisMonth - $ticketsLastMonth) / $ticketsLastMonth * 100;

        return [
            $ticketsThisMonth,
            $ticketsLastMonth,
            number_format($percentageThanLastMonth, 2, ".", ",")
        ];
    }

    private function ticketThisWeekCount()
    {
        $ticketsThisWeek = Ticket::whereHas('ticketDetail', fn($query) => $query->whereBetween('date_created', [now()->startOfWeek(), now()->endOfWeek()])->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id())))
            ->count();
        $ticketsLastWeek = Ticket::whereHas('ticketDetail', fn($query) => $query->whereBetween('date_created', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id())))
            ->count();
        $percentageThanLastWeek = $ticketsLastWeek === 0 ? 0 : ($ticketsThisWeek - $ticketsLastWeek) / $ticketsLastWeek * 100;

        return [
            $ticketsThisWeek,
            $ticketsLastWeek,
            number_format($percentageThanLastWeek, 2, ".", ",")
        ];
    }

    private function ticketPendingCount()
    {
        $tickets = Ticket::where('status', "PENDING")
            ->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id()))
            ->count();
        $ticketsRejected = Ticket::where('status', "REJECTED")
            ->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id()))
            ->count();

        return [
            $tickets,
            $ticketsRejected
        ];
    }

    private function getTicketThisWeek()
    {
        $weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        $tickets = Ticket::whereHas('ticketDetail', fn($query) => $query->whereBetween('date_created', [now()->startOfWeek(), now()->endOfWeek()]))
            ->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id()))
            ->get();

        $countsByDay = $tickets->groupBy(fn($ticket) => Carbon::parse($ticket->ticketDetail->date_created)->format('l'))
            ->map(fn($group) => $group->count());

        $result = collect($weekDays)->map(fn($day) => [
            'day'   => $day,
            'count' => $countsByDay[$day] ?? 0,
        ]);

        return $result;
    }

    private function getTicketThisYear()
    {
        $year = now()->year;

        $tickets = Ticket::whereHas('ticketDetail', fn($query) => $query->whereYear('date_created', $year))
            ->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id()))
            ->get();

        $ticketsByMonth = $tickets->groupBy(fn($ticket) => Carbon::parse($ticket->ticketDetail->date_created)->format('Y-m'))
            ->map
            ->count();

        $allMonths = collect(range(1, 12))->map(fn($month) => sprintf('%d-%02d', $year, $month));


        $result = $allMonths->map(fn($month) => [
            'month' => $month,
            'count' => $ticketsByMonth[$month] ?? 0,
        ]);

        return $result;
    }

    private function getTicketLastYear()
    {
        $year = now()->year;

        $tickets = Ticket::whereHas('ticketDetail', fn($query) => $query->whereYear('date_created', now()->subYear()->year))
            ->when(Auth::user()->userRole->role_name !== 'Admin', fn($subQuery) => $subQuery->where('login_id', Auth::id()))
            ->get();

        $ticketsByMonth = $tickets->groupBy(fn($ticket) => Carbon::parse($ticket->ticketDetail->date_created)->format('Y-m'))
            ->map
            ->count();

        $allMonths = collect(range(1, 12))->map(fn($month) => sprintf('%d-%02d', $year, $month));


        $result = $allMonths->map(fn($month) => [
            'month' => $month,
            'count' => $ticketsByMonth[$month] ?? 0,
        ]);

        return $result;
    }

    public function dashboardData()
    {
        $userCount = $this->userCount();
        [$ticketsThisMonth, $ticketsLastMonth, $percentageThanLastMonth] = $this->ticketCompletedCount();
        [$ticketsThisWeek, $ticketsLastWeek, $percentageThanLastWeek] = $this->ticketThisWeekCount();
        [$tickets, $ticketsRejected] = $this->ticketPendingCount();
        $thisWeekStats = $this->getTicketThisWeek();
        $thisYearStats = $this->getTicketThisYear();
        $lastYearStats = $this->getTicketLastYear();

        return response()->json([
            "totalUsers"                => $userCount,
            "thisLastYearStats"         => $lastYearStats,
            "thisYearStats"             => $thisYearStats,
            "ticketsThisMonth"          => $ticketsThisMonth,
            "ticketsLastMonth"          => $ticketsLastMonth,
            "percentageThanLastMonth"   => $percentageThanLastMonth,
            "ticketsThisWeek"           => $ticketsThisWeek,
            "ticketsLastWeek"           => $ticketsLastWeek,
            "percentageThanLastWeek"    => $percentageThanLastWeek,
            "tickets"                   => $tickets,
            "ticketsRejected"           => $ticketsRejected,
            "thisWeekStats"             => $thisWeekStats
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
