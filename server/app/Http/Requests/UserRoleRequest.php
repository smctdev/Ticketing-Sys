<?php

namespace App\Http\Requests;

use App\Enums\UserRoles;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'role_name'     => [
                'required',
                Rule::unique(
                    'user_roles',
                    'role_name'
                )->ignore($this->id, 'user_role_id'),
                'min:4',
                'max:50',
                Rule::enum(UserRoles::class)
            ]
        ];
    }
}
