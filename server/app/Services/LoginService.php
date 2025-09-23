<?php

namespace App\Services;

use App\Models\UserLogin;
use Illuminate\Support\Facades\Auth;

class LoginService
{
    public function authenticate($request)
    {
        $user = UserLogin::with('userDetail.userLoginCode')
            ->where('username', $request->usernameOrEmail)
            ->orWhereHas('userDetail', function ($query) use ($request) {
                $query->where('user_email', $request->usernameOrEmail);
            })
            ->first();

        if (!$user) {
            abort(400, 'Username or email not found');
        }

        $credentials = Auth::guard('web')->attempt([
            'username'       => $user->userDetail->user_email === $request->usernameOrEmail ? $user->username : $request->usernameOrEmail,
            'password'       => $request->password,
        ]);

        if ($credentials) {
            $request->session()->regenerate();

            $user?->userDetail?->userLoginCode?->delete();

            abort(204, 'Login successfully');
        }

        abort(401, 'Invalid credentials');
    }
}
