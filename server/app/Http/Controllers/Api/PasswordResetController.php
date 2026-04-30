<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePasswordResetRequest;
use Illuminate\Http\Request;

class PasswordResetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
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
     * Update the specified resource in storage.
     */
    public function update(UpdatePasswordResetRequest $request)
    {
        $request->validated();

        $request->user()->update([
            'password'            => $request->password,
            'requesting_password' => false
        ]);

        return response()->json([
            'message' => 'Password updated successfully',
            'user'    => $request->user()->load([
                'userDetail',
                'userRole',
                'branch',
                'assignedCategories.categoryGroupCode',
                'assignedBranches.branch:blist_id,b_code',
                'assignedBranchCas.branch:blist_id,b_code',
                'assignedAreaManagers.branch:blist_id,b_code',
                'accountingAssignedBranches:blist_id,b_code',
                'unreadNotifications'
            ])
                ->loadCount('unreadNotifications')
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
