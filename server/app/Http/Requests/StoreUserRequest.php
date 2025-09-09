<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
            'first_name'            => ['required', 'min:2', 'max:255', 'string'],
            'last_name'             => ['required', 'min:2', 'max:255', 'string'],
            'contact_number'        => ['nullable', 'numeric', 'digits:11'],
            'email'                 => ['required', 'min:2', 'max:255', 'string', 'email', 'lowercase', Rule::unique('user_details', 'user_email')],
            'username'              => ['required', 'min:4', 'max:255', 'string', 'lowercase', Rule::unique('user_logins', 'username')],
            'role'                  => ['required', Rule::exists('user_roles', 'user_role_id')],
            'branch_code'           => ['required', Rule::exists('branch_lists', 'blist_id')],
            'password'              => ['required', 'min:6', 'max:18', 'string']
        ];
    }
}
