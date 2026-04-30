<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubCategory;
use App\Models\TicketCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SubCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index($ticket_category_id)
    {

        $take = request('limit');

        $search = request('search');

        $ticket_category_name = TicketCategory::query()->findOrFail($ticket_category_id)->category_name;

        $sub_categories = SubCategory::query()
            ->when(
                $search,
                fn($query)
                =>
                $query->where(
                    fn($q)
                    =>
                    $q->where('sub_category_name', 'LIKE', "%$search%")
                )
            )
            ->where('ticket_category_id', $ticket_category_id)
            ->paginate($take);

        return response()->json([
            "message"       => "Sub Categories fetched successfully",
            "data"          => $sub_categories,
            'category_name' => $ticket_category_name
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
        $request->validate([
            'sub_category_name' => ['required', 'max:255', 'min:1', Rule::unique('sub_categories', 'sub_category_name')->where('ticket_category_id', $request->ticket_category_id)],
        ]);

        $sub_category = SubCategory::create([
            'ticket_category_id' => $request->ticket_category_id,
            'sub_category_name'  => Str::title($request->sub_category_name)
        ]);

        activity()
            ->causedBy(Auth::user())
            ->performedOn($sub_category)
            ->log("Added a sub category to category {$sub_category->ticketCategory->category_name}");

        return response()->json([
            'message' => "Sub category added to {$sub_category->ticketCategory->category_name} successfully"
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
    public function update(Request $request, string $id)
    {
        $request->validate([
            'sub_category_name' => ['required', 'max:255', 'min:1', Rule::unique('sub_categories', 'sub_category_name')->where('ticket_category_id', $request->ticket_category_id)->ignore($id)]
        ]);

        $sub_category = SubCategory::query()
            ->findOrFail($id);

        $sub_category->update([
            'sub_category_name' => Str::title($request->sub_category_name)
        ]);

        activity()
            ->causedBy(Auth::user())
            ->performedOn($sub_category)
            ->log("Updated a sub category to category {$sub_category->ticketCategory->category_name}");

        return response()->json([
            'message' => "Sub category of {$sub_category->ticketCategory->category_name} updated successfully"
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sub_category = SubCategory::query()
            ->findOrFail($id);

        $sub_category->delete();

        activity()
            ->causedBy(Auth::user())
            ->performedOn($sub_category)
            ->log("Deleted a sub category to category {$sub_category->ticketCategory->category_name}");

        return response()->json([
            'message' => "Sub category of {$sub_category->ticketCategory->category_name} deleted successfully"
        ], 200);
    }
}
