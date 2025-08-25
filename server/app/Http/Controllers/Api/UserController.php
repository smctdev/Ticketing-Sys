<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\UserDetail;
use App\Models\UserLogin;
use App\Models\UserRole;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $limit = request('limit');
        $search = request('search');

        $users = UserLogin::search($search)
            ->with('userDetail', 'branch', 'userRole')
            ->orderByDesc(
                UserRole::select('role_name')
                    ->whereColumn('user_logins.user_role_id', 'user_roles.user_role_id')
                    ->where('role_name', UserRoles::AUTOMATION)
            )
            ->orderBy(
                UserDetail::select('fname')
                    ->whereColumn('user_logins.user_details_id', 'user_details.user_details_id')
            )
            ->paginate($limit);

        return response()->json([
            "message"       => "Users fetched successfully",
            "data"          => $users
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
