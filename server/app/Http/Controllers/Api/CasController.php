<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchList;
use App\Models\UserLogin;
use Illuminate\Http\Request;

class CasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cas = UserLogin::with("assignedBranchCas.branch", "userRole", "userDetail")
            ->whereHas("userRole", fn($query) => $query->where("role_name", "CAS"))
            ->get();

        $remainingBranches = BranchList::whereDoesntHave("assignedBranchCas")
            ->get();

        return response()->json([
            "cas"                   => $cas->map(fn($user) => [
                "login_id"          => $user->login_id,
                "UserDetails"       => $user->userDetail,
                "UserRole"          => $user->userRole,
                "Branch"            => $user->branch,
                "AssignedBranches"  => $user->assignedBranchCas
            ]),
            "remainingBranches"     => $remainingBranches
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
