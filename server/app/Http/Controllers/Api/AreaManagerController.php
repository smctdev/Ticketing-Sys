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
        $limit = request('limit');
        $search = request('search');

        $areaManagers = UserLogin::with('userRole', 'userDetail', 'assignedAreaManagers.branch:blist_id,b_code', 'branch')
            ->search($search)
            ->whereHas(
                "userRole",
                fn($query)
                =>
                $query->where("role_name", "Area Manager")
            )
            ->paginate($limit);

        $remainingBranches = BranchList::whereDoesntHave("assignedAreaManagers")
            ->get();

        return response()->json([
            'data'                      => $areaManagers,
            'remaining_branches'        => $remainingBranches
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
