<?php

namespace App\Services;

use App\Models\UserDetail;
use Illuminate\Support\Facades\Auth;

class SubmitOtpService
{
    public function submitOtp($request)
    {
        $user = UserDetail::with('userLoginCode', 'userLogin')
            ->where('user_email', $request->email)
            ->first();

        if ($user->userLoginCode->otpCode($request->otp) && $user->userLoginCode->isValid()) {
            Auth::guard('web')->login($user->userLogin);

            $request->session()->regenerate();

            $user?->userLoginCode?->delete();

            abort(200, 'Login successfully');
        }

        abort(400, 'Invalid OTP or OTP has expired');
    }
}
