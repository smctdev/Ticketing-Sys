<?php

use App\Http\Controllers\Api\AccountingController;
use App\Http\Controllers\Api\AreaManagerController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\CasController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportReportsController;
use App\Http\Controllers\Api\ForFilterDataController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\LogoutController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SendLoginCodeController;
use App\Models\BranchList;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// AUTHENTICATED ROUTES
Route::middleware("auth:sanctum")->group(function () {
    Route::get('/profile', fn(Request $request) =>  $request->user()->load('userDetail', 'userRole', 'branch'));

    Route::controller(BranchController::class)->group(function () {
        Route::get('/get-top-branches', 'getTopBranches');
        Route::get('/get-all-branch-categories', 'getAllBranchCategories');
        Route::get('/get-all-branches-table', 'getAllBranchesTable');
        Route::get('/admin-branches', 'getAllBranches');
    });

    Route::controller(DashboardController::class)->group(function () {
        Route::get('/get-automation-data', 'index');
        Route::get('/dashboard-data', 'dashboardData');
    });

    Route::controller(NotificationController::class)->group(function () {
        Route::get('/notifications', 'index');
    });

    Route::controller(SupplierController::class)->group(function () {
        Route::get('/suppliers', 'index');
    });

    Route::controller(TicketController::class)->group(function () {
        Route::get('/tickets', 'index');
        Route::get('/reports', 'reports');
        Route::put('/update-notif/{id}', 'updateNotif');
    });

    Route::controller(CategoryController::class)->group(function () {
        Route::get('/getAllCategories', 'index');
        Route::get('/admin-ticket-categories', 'adminTicketCategories');
        Route::get('/getAssignedCategories', 'assignedCategories');
        Route::get('/getAssignedCategoryGroup/{id}', 'assignedCategoryGroup');

        Route::patch('/ticket-category/{id}/show-hide', 'showHide');
    });

    Route::controller(UserController::class)->group(function () {
        Route::get('/getAllUsersTable', 'index');
    });

    Route::controller(AutomationController::class)->group(function () {
        Route::get('/getAllAutomation', 'index');
    });

    Route::controller(AccountingController::class)->group(function () {
        Route::get('/getAllAccounting', 'index');
    });

    Route::controller(CasController::class)->group(function () {
        Route::get('/getAllCAS', 'index');
    });

    Route::controller(AreaManagerController::class)->group(function () {
        Route::get('/getAllAreaManager', 'index');
    });

    Route::controller(ForFilterDataController::class)->group(function () {
        Route::get('/for-filter-datas', 'index');
    });

    Route::controller(ExportReportsController::class)->group(
        fn()
        =>
        Route::post('/export-reports', 'exortReports')
    );
});

// GUEST ROUTES
Route::controller(BranchController::class)->group(function () {
    Route::get('/branches', 'index');
});

Route::controller(LoginController::class)->group(function () {
    Route::post('/login', 'store');
});

Route::controller(RegisterController::class)->group(function () {
    Route::post('/register', 'store');
});

Route::controller(LogoutController::class)->group(function () {
    Route::post('/logout', 'store');
});

Route::post('/test-data', function (Request $request) {

    $datas = [];

    foreach ($request->name as $index => $name) {
        $list = BranchList::create([
            'b_code'    => $name,
            'b_name'    => $request->email[$index],
            'category'  => $request->age[$index],
        ]);

        $datas[] = $list;
    }

    return response()->json([
        'message'   => 'Successfully submitted',
        'datas'     => $datas,
    ], 201);
});

Route::delete('/delete-blist', function (Request $request) {
    BranchList::whereIn('blist_id', $request->ids)->delete();

    return response()->json([
        'message'   => 'Successfully deleted',
    ], 201);
});

Route::post('/send-login-code', [SendLoginCodeController::class, 'sendLoginCode']);
Route::post('/submit-otp-login', [SendLoginCodeController::class, 'loginAsOtp']);
