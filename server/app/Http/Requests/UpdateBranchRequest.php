<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBranchRequest extends FormRequest
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
            'branch_code'             => ['required', 'string', 'min:1', 'max:255', Rule::unique('branch_lists', 'b_code')->ignore($this->id, 'blist_id')],
            'branch_name'             => ['required', 'string', 'min:1', 'max:255', Rule::unique('branch_lists', 'b_name')->ignore($this->id, 'blist_id')],
            'category'                => ['required', 'string', 'min:1', 'max:1'],
            'branch_address'          => ['required', 'string', 'min:1', 'max:255'],
            'branch_contact_number'   => ['nullable', 'numeric', 'digits:11'],
            'branch_email'            => ['nullable', 'email', 'min:1', 'max:255'],
        ];
    }
}
