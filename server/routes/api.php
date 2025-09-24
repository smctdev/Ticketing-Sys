<?php

use App\Http\Controllers\Api\AccountingController;
use App\Http\Controllers\Api\AreaManagerController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BranchListController;
use App\Http\Controllers\Api\CasController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportReportsController;
use App\Http\Controllers\Api\ForFilterDataController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\LogoutController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SendLoginCodeController;
use App\Http\Controllers\Api\UserRoleController;
use App\Models\BranchList;
use App\Models\GroupCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// AUTHENTICATED ROUTES
Route::middleware([
    "auth:sanctum",
    "throttle:50,1"
])->group(function () {
    Route::get(
        '/profile',
        fn(Request $request)
        =>
        $request->user()->load(
            'userDetail',
            'userRole',
            'branch',
            'assignedCategories.categoryGroupCode',
            'assignedBranches.branch:blist_id,b_code',
            'assignedBranchCas.branch:blist_id,b_code',
            'assignedAreaManagers.branch:blist_id,b_code',
            'unreadNotifications'
        )
            ->loadCount('unreadNotifications')
    );

    Route::controller(ProfileController::class)->group(function () {
        Route::post('/profile/update', 'update');
    });

    Route::controller(BranchController::class)->group(function () {
        Route::get('/get-top-branches', 'getTopBranches');
        Route::get('/get-all-branch-categories', 'getAllBranchCategories');
        Route::get('/get-all-branches-table', 'getAllBranchesTable');
        Route::get('/admin/branches', 'getAllBranches');
        Route::post('/branches', 'store');
        Route::patch('/branches/{id}/update', 'update');
        Route::delete('/branches/{id}/delete', 'destroy');
    });

    Route::controller(DashboardController::class)->group(function () {
        Route::get('/get-automation-data', 'index');
        Route::get('/dashboard-data', 'dashboardData');
    });

    Route::controller(SupplierController::class)->group(function () {
        Route::get('/suppliers', 'index');
        Route::post('admin/suppliers', 'store');
        Route::patch('admin/suppliers/{id}/update', 'update');
        Route::delete('admin/suppliers/{id}/delete', 'destroy');
    });

    Route::controller(TicketController::class)->group(function () {
        Route::get('/tickets', 'index');
        Route::get('/reports', 'reports');
        Route::put('/update-notif/{id}', 'updateNotif');
        Route::post('/submit-ticket', 'store');
        Route::post('/update-ticket/{id}/update', 'update');
        Route::delete('/delete-ticket/{id}/delete', 'destroy');
        Route::patch('/revise-ticket/{id}/revise', 'revise');
        Route::patch('/approve-ticket/{id}/approve', 'approve');
        Route::patch('/mark-as-edited-ticket/{id}/mark-as-edited', 'markAsEdited');
        Route::get('/view-ticket/{id}/view', 'show');
        Route::patch('/return-to-automation/{ticket_code}/return', 'returnToAutomation');
        Route::patch('/counted-or-not-counted/{ticket_code}/counted-or-not-counted', 'markAsCountedOrNotCounted');
        Route::patch('/edit-note/{ticket_code}/update', 'editNote');
    });

    Route::controller(CategoryController::class)->group(function () {
        Route::get('/categories', 'index');
        Route::get('/admin/ticket-categories', 'adminTicketCategories');
        Route::get('/getAssignedCategories', 'assignedCategories');
        Route::get('/getAssignedCategoryGroup/{id}', 'assignedCategoryGroup');
        Route::patch('/ticket-category/{id}/show-hide', 'showHide');

        Route::get('/group-categories', function () {
            return response()->json([
                'message'   => 'Successfully fetched group categories',
                'data'      => GroupCategory::all()
            ]);
        });

        Route::post('/admin/categories', 'store');
        Route::patch('/admin/categories/{ticket_category}/update', 'update');
        Route::delete('/admin/categories/{ticket_category}/delete', 'destroy');
    });

    Route::controller(UserController::class)->group(function () {
        Route::get('/users', 'index');
        Route::post('/users', 'store');
        Route::patch('/users/{id}/update', 'update');
        Route::delete('/users/{id}/delete', 'destroy');
    });

    Route::controller(AutomationController::class)->group(function () {
        Route::get('/automations', 'index');
        Route::get('/automation-branches/{user_id}/get-branches', 'show');
        Route::patch('/automation/{user_id}/update', 'update');
        Route::delete('/automation/{user_id}/delete', 'destroy');
    });

    Route::controller(AccountingController::class)->group(function () {
        Route::get('/accountings', 'index');
        Route::get('/accounting-categories', 'show');
        Route::patch('/accounting-category/{user_id}/update', 'update');
        Route::delete('/accounting-category/{user_id}/delete', 'destroy');
    });

    Route::controller(CasController::class)->group(function () {
        Route::get('/cas', 'index');
        Route::get('/cas-branches/{user_id}/get-branches', 'show');
        Route::patch('/cas/{user_id}/update', 'update');
        Route::delete('/cas/{user_id}/delete', 'destroy');
    });

    Route::controller(AreaManagerController::class)->group(function () {
        Route::get('/area-managers', 'index');
        Route::get('/area-manager-branches/{user_id}/get-branches', 'show');
        Route::patch('/area-manager/{user_id}/update', 'update');
        Route::delete('/area-manager/{user_id}/delete', 'destroy');
    });

    Route::controller(ForFilterDataController::class)->group(function () {
        Route::get('/for-filter-datas', 'index');
    });

    Route::controller(ExportReportsController::class)->group(
        fn()
        =>
        Route::post('/export-reports', 'exortReports')
    );

    Route::controller(UserRoleController::class)->group(function () {
        Route::get('admin/user-roles', 'index');
        Route::get('admin/all-user-roles', 'allUserRoles');
        Route::post('admin/user-roles', 'store');
        Route::patch('admin/user-roles/{id}/update', 'update');
        Route::delete('admin/user-roles/{id}/delete', 'destroy');
    });

    Route::controller(NotificationController::class)->group(function () {
        Route::patch('notifications/{id}/mark-as-read', 'markedAsRead');
        Route::patch('notifications/mark-all-as-read', 'markedAllAsRead');
    });

    Route::controller(PostController::class)->group(function () {
        Route::get('/posts', 'index');
        Route::post('/posts', 'store');
        Route::patch('/posts/{id}/update', 'update');
        Route::delete('/posts/{id}/delete', 'destroy');
    });

    Route::controller(CommentController::class)->group(function () {
        Route::post('/comments', 'store');
        Route::patch('/comments/{id}/update', 'update');
        Route::delete('/comments/{id}/delete', 'destroy');
    });

    Route::post('/posts/{id}/like-unline', LikeController::class);
});

// GUEST ROUTES
Route::middleware("throttle:10,1")->group(function () {
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

    Route::controller(SendLoginCodeController::class)->group(function () {
        Route::post('/send-login-code', 'sendLoginCode');
        Route::post('/submit-otp-login', 'loginAsOtp');
    });
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
})->middleware('throttle:10,1');

Route::delete('/delete-blist', function (Request $request) {
    BranchList::query()
        ->whereIn('blist_id', $request->ids)->delete();

    return response()->json([
        'message'   => 'Successfully deleted',
    ], 201);
})->middleware('throttle:10,1');
