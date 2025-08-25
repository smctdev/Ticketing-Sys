<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssignedCategory;
use App\Models\GroupCategory;
use App\Models\TicketCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = TicketCategory::where('show_hide', 'show')
            ->orderBy('category_shortcut', 'asc')
            ->get();

        return response()->json($categories, 200);
    }

    public function assignedCategories()
    {
        $assignedCategories = AssignedCategory::with('categoryGroup')
            ->where('login_id', Auth::id())
            ->get();

        return response()->json($assignedCategories, 200);
    }
    public function assignedCategoryGroup($id)
    {
        $assignedCategoryGroup = AssignedCategory::with('categoryGroup')
            ->where('login_id', $id)
            ->get();

        return response()->json($assignedCategoryGroup, 200);
    }

    public function adminTicketCategories()
    {
        $limit = request('limit');

        $search = request('search');

        $ticketCategories = TicketCategory::with('groupCategory')
            ->when(
                $search,
                fn($query)
                =>
                $query->where(
                    fn($q)
                    =>
                    $q->whereAny([
                        'category_shortcut',
                        'category_name',
                        'show_hide'
                    ], 'LIKE', "%$search%")
                )
                    ->orWhereRelation(
                        'groupCategory',
                        fn($subQuery)
                        =>
                        $subQuery->where('group_code', 'LIKE', "%$search%")
                    )
            )
            ->orderByDesc('show_hide')
            ->orderByDesc(
                GroupCategory::select('group_code')
                    ->whereColumn('group_categories.id', 'ticket_categories.group_code')
                    ->where('group_code', 'Automation')
            )
            ->paginate($limit);

        return response()->json([
            'message'       => 'Ticket categories fetched successfully',
            'data'          => $ticketCategories
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

    public function showHide(Request $request, $id)
    {
        $ticketCategory = TicketCategory::find($id);

        if (!$ticketCategory) {
            return response()->json("Category not found", 404);
        }

        $showHide = $request->show_hide ? "show" : "hide";

        $ticketCategory->update([
            "show_hide" => $showHide
        ]);

        return response()->json([
            "message"   => "Category {$ticketCategory->show_hide} successfully"
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
