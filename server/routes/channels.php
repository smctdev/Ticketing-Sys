<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes([
    'prefix'        => 'api',
    'middleware'    => ['api', 'auth:sanctum'],
]);

Broadcast::channel('App.Models.UserLogin.{login_id}', function ($user, $login_id) {
    return (int) $user->login_id === (int) $login_id;
});

Broadcast::channel('approver-of-ticket-{login_id}', function ($user, $login_id) {
    return (int) $user->login_id === (int) $login_id;
});

Broadcast::channel('updated-user-{login_id}', function ($user, $login_id) {
    return (int) $user->login_id === (int) $login_id;
});
