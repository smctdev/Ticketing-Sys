<?php

namespace App\Services;

use App\Models\UserDetail;
use App\Models\UserLogin;
use App\Notifications\UserUpdatedNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ManageUserService
{
    public function storeUser($request)
    {
        $userCreated = DB::transaction(function () use ($request) {
            $user = UserDetail::create([
                'fname'        => Str::title($request->first_name),
                'lname'        => Str::title($request->last_name),
                'user_contact' => $request->contact_number,
                'user_email'   => Str::lower($request->email),
            ]);

            $user->userLogin()->create([
                'user_details_id'     => $user->user_details_id,
                'password'            => $request->password,
                'username'            => Str::lower(Str::slug($request->username, '')),
                'user_role_id'        => $request->role,
                'blist_id'            => implode(',', $request->branch_code),
                'requesting_password' => true
            ]);

            return $user;
        });

        activity()
            ->causedBy(Auth::user())
            ->performedOn($userCreated)
            ->log("Added a user");

        return $userCreated;
    }

    public function updateUser($request, $id)
    {
        $user = UserDetail::findOrFail($id);

        $userUpdated = DB::transaction(function () use ($request, $user) {
            $user->update([
                'fname'        => Str::title($request->first_name),
                'lname'        => Str::title($request->last_name),
                'user_contact' => $request->contact_number,
                'user_email'   => Str::lower(Str::replace(' ', '', $request->email)),
            ]);

            $data = [
                'user_details_id' => $user->user_details_id,
                'username'        => Str::lower(Str::replace(' ', '_', $request->username)),
                'user_role_id'    => $request->role,
                'blist_id'        => implode(',', $request->branch_code)
            ];

            if ($request->password) {
                $data['password'] = $request->password;
                $data['requesting_password'] = true;
            }

            $user->userLogin->update($data);

            return $user;
        });

        $userData = UserLogin::query()
            ->where('user_details_id', $user->user_details_id)
            ->first();

        $userData->notify(new UserUpdatedNotification($userData));

        activity()
            ->causedBy(Auth::user())
            ->performedOn($userUpdated)
            ->log("Updated a user");

        return $userUpdated;
    }

    public function deleteUser($id)
    {
        $user = UserDetail::findOrFail($id);

        $user->userLogin()->delete();
        $user?->userLoginCode()->delete();
        $user->delete();

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Deleted a user");

        return $user;
    }
}
