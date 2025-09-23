<?php

namespace App\Services;

use App\Models\UserDetail;
use App\Models\UserLogin;

class RegisterService
{

    public function register($request)
    {
        $user = UserDetail::create([
            'fname'         => $request->fname,
            'lname'         => $request->lname,
            'user_contact'  => $request->user_contact,
            'user_email'    => $request->user_email,
        ]);

        UserLogin::create([
            'user_details_id'   => $user->user_details_id,
            'password'          => $request->password,
            'username'          => $request->username,
            'user_role_id'      => 5,
            'blist_id'          => $request->branch_code
        ]);

        abort(200, 'Registered successfully');
    }
}
