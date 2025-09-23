<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\GroupCategory;
use App\Models\UserLogin;
use Illuminate\Http\Request;

class AccountingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $search = request('search');
        $limit = request('limit');

        $accountings = UserLogin::with('userRole', 'branch', 'userDetail', 'assignedCategories.categoryGroupCode')
            ->search($search)
            ->whereRelation(
                "userRole",
                fn($query)
                =>
                $query->where('role_name', UserRoles::ACCOUNTING_HEAD)
                    ->orWhere('role_name', UserRoles::ACCOUNTING_STAFF)
            )
            ->paginate($limit);

        $allGroupCategory = GroupCategory::all();

        return response()->json([
            'data'               => $accountings,
            'group_categories'   => $allGroupCategory
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
    public function show()
    {
        $categories = GroupCategory::query()
            ->get();

        return response()->json([
            'data' => $categories,
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

        $user->accountingAssignedCategories()->sync($request->category_ids);

        $categories_count = $user->accountingAssignedCategories()->count();

        return response()->json([
            'message' => "{$categories_count} categories assigned successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = UserLogin::findOrFail($id);

        $categories_count = $user->accountingAssignedCategories()->count();

        $user->accountingAssignedCategories()->detach();


        return response()->json([
            'message' => "{$categories_count} categories removed successfully",
        ], 200);
    }
}
