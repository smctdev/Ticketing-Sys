<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\UserLogin;
use Illuminate\Http\Request;

class AreaManagerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $areaManagers = UserLogin::with('userRole', 'userDetail', 'assignedAreaManagers.branch', 'branch')
            ->whereHas("userRole", fn($query) => $query->where("role_name", "Area Manager"))
            ->get();

        $remainingBranches = BranchList::whereDoesntHave("assignedAreaManagers")
            ->get();

        return response()->json([
            'AreaManagers'              => $areaManagers->map(fn($user) => [
                'login_id'              => $user->login_id,
                'UserDetails'           => $user->userDetail,
                'UserRole'              => $user->userRole,
                'Branch'                => $user->branch,
                'AssignedBranches'      => $user->assignedAreaManagers
            ]),
            'remainingBranches'         => $remainingBranches
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
