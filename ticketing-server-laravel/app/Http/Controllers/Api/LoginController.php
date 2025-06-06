<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
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
            "usernameOrEmail"   => ['required'],
            "password"          => ["required"],
        ]);

        if ($validation->fails()) {
            return response()->json([
                'errors'    => $validation->errors(),
            ], 400);
        }

        $user = UserLogin::with('userDetail')
            ->where('username', $request->usernameOrEmail)
            ->orWhereHas('userDetail', function ($query) use ($request) {
                $query->where('user_email', $request->usernameOrEmail);
            })
            ->first();

        if (!$user) {
            return response()->json([
                'error' => 'Username or email not found',
            ], 400);
        }

        $credentials = Auth::guard('web')->attempt([
            'username'       => $user->userDetail->user_email === $request->usernameOrEmail ? $user->username : $request->usernameOrEmail,
            'password'       => $request->password,
        ]);

        if ($credentials) {
            $request->session()->regenerate();

            return response()->json([
                'message'   =>  'Login successfully',
            ], 204);
        }

        return response()->json([
            'message'       => 'Invalid credentials',
            'wow' => $user->userDetail->user_email
        ], 400);
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
