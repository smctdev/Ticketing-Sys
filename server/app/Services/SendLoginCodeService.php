<?php

namespace App\Services;

use App\Mail\LoginAsCodeMail;
use App\Models\UserDetail;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SendLoginCodeService
{
    public function sendEmail($email)
    {
        $user = UserDetail::with('userLoginCode')
            ->where('user_email', $email)
            ->first();

        if (!$user) {
            throw new HttpException(404, 'The email you entered does not exist in our system.');
        }

        $random_code = random_int(100000, 999999);

        $user?->userLoginCode?->delete();

        $user->userLoginCode()->create([
            'user_details_id'   => $user->user_details_id,
            'code'              => $random_code,
            'expires_at'        => now()->addMinutes(30)
        ]);

        $name = "{$user?->fname} {$user?->lname}";

        Mail::to($user->user_email)->queue(new LoginAsCodeMail($random_code, $name));

        throw new HttpException(200, 'Login code sent successfully');
    }
}
