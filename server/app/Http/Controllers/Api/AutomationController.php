<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRoles;
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

        $automations = UserLogin::with('userRole', 'branch', 'userDetail', 'assignedBranches.branch:blist_id,b_code')
            ->whereRelation(
                "userRole",
                fn($query)
                =>
                $query->where('role_name', UserRoles::AUTOMATION)
            )
            ->search($search)
            ->paginate($limit);

        $remainingBranches = BranchList::whereDoesntHave('assignedBranches')
            ->get();

        return response()->json([
            'data'                   => $automations,
            'remaining_branches'     => $remainingBranches
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
    public function show(string $userId)
    {
        $user = UserLogin::with('automationAssignedBranches')->findOrFail($userId);

        $branches = BranchList::query()
            ->whereDoesntHave("branchAssignedAutomations")
            ->get();

        $userBranches = $user->automationAssignedBranches;

        return response()->json([
            'data' => $userBranches->merge($branches),
        ]);
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
        $user = UserLogin::findOrFail($id);

        $user->automationAssignedBranches()->sync($request->branch_codes);

        $branch_counts = $user->automationAssignedBranches()->count();

        return response()->json([
            'message' => "{$branch_counts} branche(s) assigned successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = UserLogin::findOrFail($id);

        $branch_counts = $user->automationAssignedBranches()->count();

        $user->automationAssignedBranches()->detach();


        return response()->json([
            'message' => "{$branch_counts} branche(s) removed successfully",
        ], 200);
    }
}
