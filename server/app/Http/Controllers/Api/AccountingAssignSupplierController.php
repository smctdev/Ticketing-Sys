<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\UserRoles;
use App\Models\UserLogin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountingAssignSupplierController extends Controller
{
    /**
     * Ang mga supplier ID nga assigned sa accounting staff.
     */
    public function index($loginId): JsonResponse
    {
        $user = $this->findAccountingStaff($loginId);

        return response()->json([
            'message' => 'Assigned suppliers fetched successfully',
            'data'    => $user->assignedSuppliers->pluck('id')->values(),
        ]);
    }

    /**
     * I-replace ang assigned suppliers sa accounting staff.
     * Empty array = wala nay specific supplier (catch-all).
     */
    public function update(Request $request, $loginId): JsonResponse
    {
        $request->validate([
            'supplier_ids'   => ['present', 'array'],
            'supplier_ids.*' => ['integer', 'distinct', 'exists:suppliers,id'],
        ]);

        $user = $this->findAccountingStaff($loginId);

        $user->assignedSuppliers()->sync($request->supplier_ids ?? []);

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Updated assigned suppliers of {$user->full_name}");

        return response()->json([
            'message' => 'Assigned suppliers updated successfully.',
        ]);
    }

    /**
     * Accounting Staff lang ang pwede ma-assign ug suppliers.
     */
    private function findAccountingStaff($loginId): UserLogin
    {
        return UserLogin::query()
            ->whereRelation('userRole', 'role_name', UserRoles::ACCOUNTING_STAFF)
            ->findOrFail($loginId);
    }
}