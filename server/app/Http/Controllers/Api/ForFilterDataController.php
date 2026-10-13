<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\TicketCategory;
use Illuminate\Support\Facades\Auth;

class ForFilterDataController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $is_automation = $user->isAutomation();

        $branches = BranchList::whereHas('tickets', fn($q) => $q->where('status', 'EDITED'))
            ->when(
                $is_automation,
                fn($q)
                =>
                $q->whereIn(
                    'blist_id',
                    $user->assignedBranches()->pluck('blist_id')
                )
            )
            ->orderBy('b_name')
            ->get();

        $ticket_categories = TicketCategory::has('ticketDetails')
            ->where('show_hide', 'show')
            ->orderBy('category_name')
            ->get();

        $branch_types = BranchList::orderBy('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'message'               => "Data fetched successfully",
            "data"                  => [
                'branches'          => $branches,
                'ticket_categories' => $ticket_categories,
                'branch_types'      => $branch_types
            ]
        ]);
    }
}
