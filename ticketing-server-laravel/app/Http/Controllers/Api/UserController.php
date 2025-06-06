<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLogin;
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

        $users = UserLogin::when($search, fn($query) =>
        $query->whereHas('userDetail', fn($subQuery) =>
        $subQuery->where('fname', 'LIKE', "%$search%")
            ->orWhere('lname', 'LIKE', "%$search%")
            ->orWhere('user_contact', 'LIKE', "%$search%")
            ->orWhere('user_email', 'LIKE', "%$search%")
            ->orWhereRaw("CONCAT(fname, ' ', lname) LIKE ?", ["%$search%"]))
            ->orWhereHas('userRole', fn($subQuery) =>
            $subQuery->where('role_name', 'LIKE', "%$search%"))
            ->orWhereHas('branch', fn($subQuery) =>
            $subQuery->where('b_code', 'LIKE', "%$search%")
                ->orWhere('b_name', 'LIKE', "%$search%")
                ->where('category', 'LIKE', "%$search%")))
            ->with('userDetail', 'branch', 'userRole')
            ->paginate($limit);

        return response()->json([
            'count'                     => $users->total(),
            'rows'                      => $users->map(fn($user) => [
                "login_id"              => $user->login_id,
                "user_details_id"       => $user->user_details_id,
                "username"              => $user->username,
                "full_name"             => $user->full_name,
                "user_role_id"          => $user->user_role_id,
                "blist_id"              => $user->blist_id,
                "requesting_password"   => $user->requesting_password,
                "UserDetails"           => $user->userDetail,
                "UserRole"              => $user->userRole,
                "Branch"                => $user->branch,
                "branches"              => [$user->branch?->b_code]
            ])
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
