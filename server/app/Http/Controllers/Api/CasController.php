<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRoles;
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
        $limit = request('limit');
        $search = request('search');

        $cas = UserLogin::with("assignedBranchCas.branch:blist_id,b_code", "userRole", "userDetail")
            ->search($search)
            ->whereRelation(
                "userRole",
                fn($query)
                =>
                $query->where("role_name", UserRoles::CAS)
            )
            ->paginate($limit);

        $remainingBranches = BranchList::whereDoesntHave("assignedBranchCas")
            ->get();

        return response()->json([
            "data"                   => $cas,
            "remaining_branches"     => $remainingBranches
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
