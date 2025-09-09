<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRoleRequest;
use App\Services\UserRoleService;
use Illuminate\Http\Request;

class UserRoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(UserRoleService $userRoleService)
    {
        $search = request('search');
        $limit = request('limit');

        $userRoles = $userRoleService->getUserRole($search, $limit);

        return response()->json([
            'message'       => "User roles fetched successfully",
            'data'          => $userRoles
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
    public function store(UserRoleRequest $request, UserRoleService $userRoleService)
    {
        $request->validated();

        $userRole = $userRoleService->storeUserRole($request);

        return response()->json([
            'message'       => "User role \"{$userRole->role_name->value}\" created successfully",
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
    public function update(UserRoleRequest $request, string $id, UserRoleService $userRoleService)
    {
        $request->validated();

        $userRole = $userRoleService->updateUserRole($request, $id);

        return response()->json([
            'message'       => "User role \"{$userRole->role_name->value}\" updated successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id, UserRoleService $userRoleService)
    {
        $userRole = $userRoleService->deleteUserRole($id);

        return response()->json([
            'message'       => "User role \"{$userRole->role_name->value}\" deleted successfully",
        ], 200);
    }

    public function allUserRoles(UserRoleService $userRoleService)
    {
        return response()->json([
            'message'       => "Guest user roles fetched successfully",
            'data'          => $userRoleService->allUserRoles()
        ], 200);
    }
}
