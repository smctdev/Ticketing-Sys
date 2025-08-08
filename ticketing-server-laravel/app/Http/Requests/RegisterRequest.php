<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
            'fname'         => ['required', 'max:255', 'min:2'],
            'lname'         => ['required', 'max:255', 'min:2'],
            'user_contact'  => ['required', 'numeric', 'digits:11'],
            'user_email'    => ['required', 'email', 'max:255', 'min:5', Rule::unique('user_details', 'user_email')],
            'username'      => ['required', 'min:4', 'max:15', Rule::unique('user_logins', 'username')],
            'password'      => ['required', 'min:6', 'max:15', 'confirmed'],
            'blist_id'      => ['required', Rule::exists('branch_lists', 'blist_id')]
        ];
    }

    public function messages(): array
    {
        return [
            'fname.required'        => 'First name is required',
            'fname.max'             => 'First name must be less than 255 characters',
            'fname.min'             => 'First name must be at least 2 characters',
            'lname.required'        => 'Last name is required',
            'lname.max'             => 'First name must be less than 255 characters',
            'lname.min'             => 'First name must be at least 2 characters',
            'user_contact.required' => 'Contact number is required',
            'user_contact.numeric'  => 'Contact number must be a number',
            'user_contact.digits'   => 'Contact number must be 11 digits',
            'user_email.required'   => 'Email is required',
            'user_email.email'      => 'Invalid email format',
            'user_email.unique'     => 'Email already exists',
            'user_email.max'        => 'Email must be less than 255 characters',
            'user_email.min'        => 'Email must be at least 5 characters',
            'blist_id.required'     => 'Branch code is required',
            'blist_id.exists'       => 'Invalid branch code',
        ];
    }
}
