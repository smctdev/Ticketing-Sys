<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchDetail;
use App\Models\BranchList;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $branches = BranchList::query()
            ->orderBy('b_code')
            ->get([
                'blist_id',
                'b_code'
            ]);

        return response()->json([
            "data" => $branches
        ], 200);
    }

    public function getAllBranches()
    {
        $limit = request('limit');
        $search = request('search');

        $branches = BranchDetail::with('branch')
            ->when(
                $search,
                fn($query)
                =>
                $query->where(
                    fn($q)
                    =>
                    $q->whereAny([
                        'b_address',
                        'b_contact',
                        'b_email'
                    ], 'LIKE', "%$search%")
                        ->orWhereRelation(
                            'branch',
                            fn($sq)
                            =>
                            $sq->whereAny([
                                'b_code',
                                'b_name',
                                'category'
                            ], 'LIKE', "%$search%")
                        )
                )
            )
            ->orderBy(
                BranchList::select('b_code')
                    ->whereColumn('branch_details.blist_id', 'branch_lists.blist_id')
            )
            ->paginate($limit);

        return response()->json([
            'message'       => 'Branches fetched successfully',
            'data'          => $branches
        ], 200);
    }

    public function getTopBranches()
    {
        $topBranches = BranchList::withCount('editedTickets')
            ->whereHas('editedTickets')
            ->get('blist_id');

        return response()->json(
            $topBranches->map(fn($top) => [
                'branch'    => $top->b_name,
                'count'     => $top->edited_tickets_count,
            ]),
            200
        );
    }

    public function getAllBranchCategories()
    {
        $branchCategories = BranchList::orderBy('category')->distinct()->pluck('category');

        return response()->json($branchCategories, 200);
    }

    public function getAllBranchesTable()
    {
        $limit = request('limit');

        $search = request('search');

        $branchDetails = BranchDetail::with('branch')
            ->when($search, fn($query)
            => $query->whereHas('branch', fn($subQuery)
            => $subQuery->where('b_code', 'LIKE', "%$search%")
                ->orWhere('b_name', 'LIKE', "%$search%")
                ->orWhere('category', 'LIKE', "%$search%")))
            ->orWhere('b_address', 'LIKE', "%$search%")
            ->orWhere('b_contact', 'LIKE', "%$search%")
            ->orWhere('b_email', 'LIKE', "%$search%")
            ->paginate($limit);

        return response()->json([
            'count'             => $branchDetails->total(),
            'rows'              => $branchDetails->map(fn($branchDetail) => [
                "bdetails_id"   => $branchDetail->bdetails_id,
                "blist_id"      => $branchDetail->blist_id,
                "b_address"     => $branchDetail->b_address,
                "b_contact"     => $branchDetail->b_contact,
                "b_email"       => $branchDetail->b_email,
                "Branch"        => $branchDetail->branch
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
