<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
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
            'profile_picture'       => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:1024'],
            'first_name'            => ['required', 'string', 'min:2', 'max:255'],
            'last_name'             => ['required', 'string', 'min:2', 'max:255'],
            'contact_number'        => ['nullable', 'numeric', 'digits:11'],
            'email'                 => ['required', 'email', 'min:2', 'max:255'],
            'current_password'      => ['nullable', 'string', 'min:6', 'max:255', 'current_password'],
            'password'              => ["nullable", 'required_with:current_password', 'string', 'min:6', 'max:255', 'different:current_password', 'confirmed'],
        ];
    }
}
