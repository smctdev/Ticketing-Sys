<?php

namespace App\Services;

use App\Models\UserDetail;
use App\Models\UserLogin;
use Illuminate\Support\Str;

class RegisterService
{

    public function register($request)
    {
        $user = UserDetail::create([
            'fname'         => Str::title($request->fname),
            'lname'         => Str::title($request->lname),
            'user_contact'  => $request->user_contact,
            'user_email'    => Str::lower(Str::replace(' ', '', $request->user_email)),
        ]);

        UserLogin::create([
            'user_details_id'   => $user->user_details_id,
            'password'          => $request->password,
            'username'          => Str::lower(Str::replace(' ', '_', $request->username)),
            'user_role_id'      => 5,
            'blist_id'          => $request->blist_id
        ]);

        abort(200, 'Registered successfully');
    }
}
