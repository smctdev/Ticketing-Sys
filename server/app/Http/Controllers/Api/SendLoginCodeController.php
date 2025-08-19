<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendLoginCodeRequest;
use App\Http\Requests\SubmitOtpRequest;
use App\Services\SendLoginCodeService;
use App\Services\SubmitOtpService;
use Illuminate\Http\Request;

class SendLoginCodeController extends Controller
{

    public function sendLoginCode(SendLoginCodeRequest $request, SendLoginCodeService $sendLoginCodeService)
    {
        $request->validated();

        $sendLoginCodeService->sendEmail($request->email);
    }

    public function loginAsOtp(SubmitOtpRequest $request, SubmitOtpService $submitOtpService)
    {

        $request->validated();

        $submitOtpService->submitOtp($request->otp, $request->email, $request->session());
    }
}
