<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExportReportsController extends Controller
{
    public function exortReports(ReportsService $reportsService, Request $request)
    {
        $edited_start_date = $request->edited_start_date;
        $edited_end_date = $request->edited_end_date;
        $edited_transaction_start_date = $request->edited_transaction_start_date;
        $edited_transaction_end_date = $request->edited_transaction_end_date;
        $created_start_date = $request->created_start_date;
        $created_end_date = $request->created_end_date;
        $branchCode = $request->branch_code;
        $ticketCategory = $request->ticket_category;
        $branchCategory = $request->branch_type;
        $search = $request->search;

        $user = Auth::user();

        $userRole = $user->userRole;

        $data = $reportsService->exportReports(
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
            $search
        );

        return response()->json([
            'message'    => 'Reports to exported fetched successfully',
            'data'       => $data
        ], 200);
    }
}
