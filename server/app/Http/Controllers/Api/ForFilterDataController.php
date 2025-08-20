<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\TicketCategory;
use Illuminate\Http\Request;

class ForFilterDataController extends Controller
{
    public function index()
    {
        $branches = BranchList::has('tickets')
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
            'branches'              => $branches,
            'ticket_categories'     => $ticket_categories,
            'branch_types'          => $branch_types
        ]);
    }
}
