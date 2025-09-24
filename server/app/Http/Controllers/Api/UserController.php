<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\UserDetail;
use App\Models\UserLogin;
use App\Models\UserRole;
use App\Services\ManageUserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
            ->whereNot('login_id', Auth::id())
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
    public function store(StoreUserRequest $request, ManageUserService $manageUserService)
    {
        $request->validated();

        $data = $manageUserService->storeUser($request);

        return response()->json([
            "message"       => "User \"{$data->user_email}\" created successfully",
        ], 201);
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
    public function update(UpdateUserRequest $request, string $id, ManageUserService $manageUserService)
    {
        $request->validated();

        $data = $manageUserService->updateUser($request, $id);

        return response()->json([
            "message"       => "User \"{$data->user_email}\" updated successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, ManageUserService $manageUserService)
    {
        $data = $manageUserService->deleteUser($id);

        return response()->json([
            "message"       => "User \"{$data->user_email}\" deleted successfully",
        ], 200);
    }
}
