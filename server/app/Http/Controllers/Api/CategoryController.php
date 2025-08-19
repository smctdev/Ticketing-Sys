<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssignedCategory;
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

    public function getAllCategoriesTable()
    {
        $limit = request('limit');

        $search = request('search');

        $ticketCategories = TicketCategory::with('categoryGroup')
            ->when($search, fn($query)
            => $query->whereHas('categoryGroup', fn($subQuery)
            => $subQuery->where('group_code', 'LIKE', "%$search%")))
            ->orWhere('category_shortcut', 'LIKE', "%$search%")
            ->orWhere('category_name', 'LIKE', "%$search%")
            ->orWhere('show_hide', 'LIKE', "%$search%")
            ->paginate($limit);

        return response()->json([
            'count'                     => $ticketCategories->total(),
            'rows'                      => $ticketCategories->map(fn($ticketCategory) => [
                "ticket_category_id"    => $ticketCategory->ticket_category_id,
                "category_shortcut"     => $ticketCategory->category_shortcut,
                "category_name"         => $ticketCategory->category_name,
                "group_code"            => $ticketCategory->group_code,
                "show_hide"             => $ticketCategory->show_hide,
                "CategoryGroup"         => $ticketCategory->categoryGroup
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

    public function showHide($id)
    {
        $ticketCategory = TicketCategory::find($id);

        if (!$ticketCategory) {
            return response()->json("Category not found", 400);
        }

        $showHide = $ticketCategory->show_hide === "hide" ? "show" : "hide";

        $ticketCategory->update([
            "show_hide" => $showHide
        ]);

        return response()->json([
            "message" => "Category $ticketCategory->show_hide successfully"
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
