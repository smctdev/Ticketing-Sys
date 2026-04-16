<?php

use App\Http\Controllers\Api\AccountingBranchSetupController;
use App\Http\Controllers\Api\AccountingController;
use App\Http\Controllers\Api\AreaManagerController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BranchListController;
use App\Http\Controllers\Api\CasController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportReportsController;
use App\Http\Controllers\Api\ForFilterDataController;
use App\Http\Controllers\Api\LikeController;
use App\Http\Controllers\Api\LoginController;
use App\Http\Controllers\Api\LogoutController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SendLoginCodeController;
use App\Http\Controllers\Api\SubCategoryController;
use App\Http\Controllers\Api\UserRoleController;
use App\Models\BranchList;
use App\Models\GroupCategory;
use App\Models\UserLogin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

// AUTHENTICATED ROUTES
Route::middleware([
    "auth:sanctum",
    "throttle:100,1"
])->group(function () {
    Route::get(
        '/profile',
        fn(Request $request)
        =>
        $request->user()
            ->loadCount('unreadMessages')
            ->load(
                'userDetail',
                'userRole',
                'branch',
                'assignedCategories.categoryGroupCode',
                'assignedBranches.branch:blist_id,b_code',
                'assignedBranchCas.branch:blist_id,b_code',
                'assignedAreaManagers.branch:blist_id,b_code',
                'accountingAssignedBranches:blist_id,b_code',
                'unreadNotifications',
                'unreadMessages'
            )
            ->loadCount('unreadNotifications')
    );

    Route::post('/password-reset', [PasswordResetController::class, 'update']);

    Route::controller(ProfileController::class)->group(function () {
        Route::post('/profile/update', 'update');
    });

    Route::controller(BranchController::class)->group(function () {
        Route::get('/get-top-branches', 'getTopBranches');
        Route::get('/get-all-branch-categories', 'getAllBranchCategories');
        Route::get('/get-all-branches-table', 'getAllBranchesTable');
        Route::post('/branches', 'store');
        Route::patch('/branches/{id}/update', 'update');
        Route::delete('/branches/{id}/delete', 'destroy');
        Route::prefix('admin')->group(function () {
            Route::get('branches', 'getAllBranches');
        });
    });

    Route::controller(DashboardController::class)->group(function () {
        Route::get('/get-automation-data', 'index');
        Route::get('/dashboard-data', 'dashboardData');
    });

    Route::controller(SupplierController::class)->group(function () {
        Route::get('/suppliers', 'index');
        Route::prefix('admin')->group(function () {
            Route::post('suppliers', 'store');
            Route::patch('suppliers/{id}/update', 'update');
            Route::delete('suppliers/{id}/delete', 'destroy');
        });
    });

    Route::controller(TicketController::class)->group(function () {
        Route::get('/tickets', 'index');
        Route::get('/audit-dashboard-tickets', 'auditIndex');
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
        Route::patch('/transfer-ticket/{ticket_code}/to-automation', 'transferTicketToAutomation');
        Route::get('/{ticket_detail}/download-zip', 'downloadZip');
    });

    Route::controller(CategoryController::class)->group(function () {
        Route::get('/categories', 'index');
        Route::get('/getAssignedCategories', 'assignedCategories');
        Route::get('/getAssignedCategoryGroup/{id}', 'assignedCategoryGroup');
        Route::patch('/ticket-category/{id}/show-hide', 'showHide');
        Route::get('/group-categories', function () {
            return response()->json([
                'message'   => 'Successfully fetched group categories',
                'data'      => GroupCategory::all()
            ]);
        });
        Route::prefix('admin')->group(function () {
            Route::get('ticket-categories', 'adminTicketCategories');
            Route::post('categories', 'store');
            Route::patch('categories/{ticket_category}/update', 'update');
            Route::delete('categories/{ticket_category}/delete', 'destroy');
        });
    });

    Route::controller(UserController::class)->group(function () {
        Route::get('/users', 'index');
        Route::post('/users', 'store');
        Route::patch('/users/{id}/update', 'update');
        Route::delete('/users/{id}/delete', 'destroy');
        Route::get('/user-branch-heads', 'displayBranchHeads');
    });

    Route::controller(AutomationController::class)->group(function () {
        Route::get('/automations', 'index');
        Route::get('/automation-branches/{user_id}/get-branches', 'show');
        Route::patch('/automation/{user_id}/update', 'update');
        Route::delete('/automation/{user_id}/delete', 'destroy');
        Route::get('/all-automations', 'getAllAutomations');
    });

    Route::controller(AccountingBranchSetupController::class)->group(function () {
        Route::get('/accounting-branches/{user_id}/get-branches', 'show');
        Route::patch('/accounting/{user_id}/update', 'update');
        Route::delete('/accounting/{user_id}/delete', 'destroy');
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
        Route::post('/export-reports', 'exportReports')
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
        Route::get('/comments/{post_id}/comments', 'index');
        Route::post('/comments', 'store');
        Route::patch('/comments/{id}/update', 'update');
        Route::delete('/comments/{id}/delete', 'destroy');
    });

    Route::post('/posts/{id}/like-unline', LikeController::class);

    Route::prefix('admin')->controller(SubCategoryController::class)->group(function () {
        Route::get('sub-categories/{ticket_category_id}/ticket-category-items', 'index');
        Route::post('sub-categories', 'store');
        Route::patch('sub-categories/{id}/update', 'update');
        Route::delete('sub-categories/{id}/delete', 'destroy');
    });

    Route::resource('chats', ChatController::class)->only(['show', 'store', 'index']);
    Route::delete('unseen-message/{id}/flush', [ChatController::class, 'flushUnseenMessage']);

    Route::prefix('super-admin')->group(function () {
        Route::get('activities', function (Request $request) {
            if (!Auth::user()->isSuperAdmin()) {
                abort(403);
            }

            $activities = Activity::with([
                'causer:login_id,user_details_id,user_role_id',
                'causer.userDetail:user_details_id,lname,fname,user_email',
                'causer.userRole:user_role_id,role_name'
            ])
                ->when($request->search, function ($q) use ($request) {
                    $q->whereHas('causer', function ($query) use ($request) {
                        $query->search($request->search);
                    })
                        ->orWhereLike('description', "%{$request->search}%");
                })
                ->latest()
                ->paginate($request->limit, ['id', 'description', 'causer_id', 'causer_type', 'created_at'])
                ->through(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'description' => $activity->description,
                        'full_name'   => $activity->causer?->full_name,
                        'email'       => $activity->causer?->userDetail?->user_email,
                        'role'        => $activity->causer?->userRole?->role_name,
                        'created_at'  => $activity->created_at
                    ];
                });

            return response()->json([
                'message' => 'Successfully fetch activities',
                'data'    => $activities
            ], 200);
        });
    });
});

// GUEST ROUTES
Route::middleware(["throttle:20,1"])->group(function () {
    Route::controller(BranchController::class)->group(function () {
        Route::get('/branches', 'index')->withoutMiddleware('throttle:20,1');
    });

    Route::controller(LoginController::class)->group(function () {
        Route::post('/login', 'store');
    });

    Route::controller(RegisterController::class)->group(function () {
        Route::post('/register', 'store');
    });

    Route::controller(LogoutController::class)->group(function () {
        Route::post('/logout', 'store')->withoutMiddleware('throttle:20,1');
    });

    Route::controller(SendLoginCodeController::class)->group(function () {
        Route::post('/send-login-code', 'sendLoginCode');
        Route::post('/submit-otp-login', 'loginAsOtp');
    });


    Route::delete('/delete-blist', function (Request $request) {
        BranchList::query()
            ->whereIn('blist_id', $request->ids)->delete();

        return response()->json([
            'message'   => 'Successfully deleted',
        ], 201);
    });
});

Route::post('/change-password-to-all-user', function () {
    $password_key = request('password_key');

    if ($password_key !== config('app.password_key')) {
        abort(403, 'Unauthorized');
    }

    $total_user_added = 0;

    $users_to_update = [];

    UserLogin::query()->with('userDetail')->chunk(100, function ($users) use (&$total_user_added, &$users_to_update) {
        $users->each(function ($user) use (&$total_user_added, &$users_to_update) {

            $users_to_update[] = [
                'login_id'            => $user->login_id,
                'password'            => Hash::make(Str::of($user->userDetail->lname ?: $user->userDetail->fname)->substr(0, 3)->append('_123456')->lower(), [
                    'rounds' => 10
                ]),
                'user_details_id'     => $user->user_details_id,
                'username'            => $user->username,
                'user_role_id'        => $user->user_role_id,
                'requesting_password' => true
            ];

            $total_user_added++;
        });
    });

    UserLogin::upsert($users_to_update, ['login_id'], ['password', 'requesting_password']);

    return response()->json([
        'message' => "Successfully changed password to {$total_user_added} users."
    ], 200);
});
