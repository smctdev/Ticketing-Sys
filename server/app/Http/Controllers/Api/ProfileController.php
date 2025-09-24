<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
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
    public function update(UpdateProfileRequest $request)
    {
        $request->validated();

        $user = Auth::user()
            ->load(
                'userDetail',
                'userRole',
                'branch',
                'assignedCategories.categoryGroupCode',
                'assignedBranches.branch:blist_id,b_code',
                'assignedBranchCas.branch:blist_id,b_code',
                'assignedAreaManagers.branch:blist_id,b_code',
                'unreadNotifications'
            );

        $path = "";

        $updatedData = [
            'fname'         => $request->first_name,
            'lname'         => $request->last_name,
            'user_email'    => $request->email,
            'user_contact'  => $request->contact_number,
        ];

        if ($request->hasFile('profile_picture')) {
            $profile_picture = $request->file('profile_picture');
            $file_name = time() . '-' . $profile_picture->getClientOriginalName();
            $path = $profile_picture->storeAs('uploads', $file_name, 'public');
            if (Storage::disk('public')->exists($user->userDetail->profile_pic)) {
                Storage::disk('public')->delete($user->userDetail->profile_pic);
            }

            $updatedData['profile_pic'] = $path;
        }

        if ($request->password) {
            $updatedData['password'] = $request->password;
        }

        $user->userDetail->update($updatedData);

        return response()->json([
            "message" => "Profile updated successfully",
            'data'    => $user
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
