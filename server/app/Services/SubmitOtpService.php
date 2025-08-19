<?php

namespace App\Services;

use App\Models\UserDetail;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SubmitOtpService
{
    public function submitOtp($otp, $email, $session)
    {
        $user = UserDetail::with('userLoginCode', 'userLogin')
            ->where('user_email', $email)
            ->first();

        if ($user->userLoginCode->otpCode($otp) && $user->userLoginCode->isValid()) {
            Auth::guard('web')->login($user->userLogin);

            $session->regenerate();

            $user?->userLoginCode?->delete();

            throw new HttpException(200, 'Login successfully');
        }

        throw new HttpException(400, 'Invalid OTP or OTP has expired');
    }
}
