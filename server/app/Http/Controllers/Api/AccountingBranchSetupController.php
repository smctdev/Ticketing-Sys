<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountingBranchSetupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $user = UserLogin::with([
            'accountingAssignedBranches',
            'assignedCategories'
        ])->findOrFail($userId);

        $branches = BranchList::query()
            ->whereDoesntHaveRelation(
                'branchAssignedAccountings.assignedCategories',
                'group_code',
                $user->assignedCategories[0]->group_code
            )
            ->get();

        $userBranches = $user->accountingAssignedBranches;

        $data = collect(
            $userBranches->merge($branches)
        )
            ->sortBy('b_code')
            ->values();

        return response()->json([
            'data' => $data,
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

        $user->accountingAssignedBranches()->sync($request->branch_codes);

        $branch_counts = $user->accountingAssignedBranches()->count();

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Updated a accounting");

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

        $branch_counts = $user->accountingAssignedBranches()->count();

        $user->accountingAssignedBranches()->detach();

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Deleted a accounting branch");

        return response()->json([
            'message' => "{$branch_counts} branche(s) removed successfully",
        ], 200);
    }
}
