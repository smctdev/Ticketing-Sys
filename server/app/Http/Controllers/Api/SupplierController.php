<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $limit = request('limit');
        $search = request('search');

        $suppliers = Supplier::when(
            $search,
            fn($query)
            =>
            $query->where('suppliers', 'LIKE', "%$search%")
        )
            ->paginate($limit);

        return response()->json([
            "message"           => "Suppliers fetched successfully",
            "data"              => $suppliers
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
    public function store(StoreSupplierRequest $request)
    {
        $request->validated();

        $supplier = Supplier::query()
            ->create([
                'suppliers'    => $request->suppliers
            ]);

        return response()->json([
            "message"           => "Supplier \"{$supplier->suppliers}\" created successfully",
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
    public function update(UpdateSupplierRequest $request, string $id)
    {
        $request->validated();

        $supplier = Supplier::findOrFail($id);

        $supplier->update([
            'suppliers'    => $request->suppliers
        ]);

        return response()->json([
            "message"           => "Supplier \"{$supplier->suppliers}\" updated successfully",
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $supplier = Supplier::findOrFail($id);

        $supplier->delete();

        return response()->json([
            "message"           => "Supplier \"{$supplier->suppliers}\" deleted successfully",
        ], 200);
    }
}
