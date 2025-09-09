<?php

namespace App\Services;

use App\Models\UserRole;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class UserRoleService
{
    public function getUserRole($search, $limit)
    {
        $userRoles = UserRole::query()
            ->when(
                $search,
                fn($query)
                =>
                $query->where(
                    fn($q)
                    =>
                    $q->where('role_name', 'LIKE', "%{$search}%")
                )
            )
            ->paginate($limit);

        return $userRoles;
    }

    public function storeUserRole($request)
    {
        $userRole =  UserRole::query()
            ->create([
                'role_name'     => Str::title($request->role_name)
            ]);

        return $userRole;
    }

    public function updateUserRole($request, $id)
    {
        $userRole = UserRole::findOrFail($id);

        $hasUser = $userRole->users()->exists();

        if ($hasUser) {
            throw new HttpException(400, 'Cannot update user role that has users');
        }

        $userRole->update([
            'role_name'     => Str::title($request->role_name)
        ]);

        return $userRole;
    }

    public function deleteUserRole($id)
    {
        $userRole = UserRole::findOrFail($id);

        $hasUser = $userRole->users()->exists();

        if ($hasUser) {
            throw new HttpException(400, 'Cannot delete user role that has users');
        }

        $userRole->delete();

        return $userRole;
    }

    public function allUserRoles()
    {
        return UserRole::query()
            ->orderBy('role_name')
            ->get();
    }
}
