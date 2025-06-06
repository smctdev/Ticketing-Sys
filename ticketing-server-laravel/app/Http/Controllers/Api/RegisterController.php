<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserDetail;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        $validation = Validator::make($request->all(), [
            'firstname'     => ['required'],
            'lastname'      => ['required'],
            'contact'       => ['required'],
            'email'         => ['required'],
            'username'      => ['required'],
            'password'      => ['required'],
            'branch_code'   => ['required']
        ]);

        if ($validation->fails()) {
            return response()->json([
                'errors' => $validation->errors()
            ], 400);
        }

        $user = UserDetail::create([
            'fname'         => $request->firstname,
            'lname'         => $request->lastname,
            'user_contact'  => $request->contact,
            'user_email'    => $request->email,
        ]);

        UserLogin::create([
            'user_details_id'   => $user->user_details_id,
            'password'          => $request->password,
            'username'          => $request->username,
            'user_role_id'      => 5,
            'blist_id'          => $request->branch_code
        ]);

        return response()->json([
            'message'   => 'Registerd successfully'
        ], 204);
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
