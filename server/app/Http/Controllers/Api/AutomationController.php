<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\UserLogin;
use Illuminate\Http\Request;

class AutomationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $limit = request('limit');
        $search = request('search');

        $automations = UserLogin::with('userRole', 'branch', 'userDetail', 'assignedBranches.branch')
            ->whereHas("userRole", fn($query) =>
            $query->where('role_name', 'Automation'))
            ->get();

        $remainingBranches = BranchList::whereDoesntHave('assignedBranches')
            ->get();

        return response()->json([
            'automations'           => $automations->map(fn($automation) => [
                "login_id"          => $automation->login_id,
                "UserDetails"       => $automation->userDetail,
                "UserRole"          => $automation->userRole,
                "Branch"            => $automation->branch,
                "AssignedBranches"  => $automation->assignedBranches->map(fn($branch) => $branch->branch->b_code)
            ]),
            'remainingBranches'     => $remainingBranches
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
