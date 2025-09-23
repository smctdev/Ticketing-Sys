<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
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
            'suppliers'         => ['required', 'string', 'min:2', 'max:255', Rule::unique('suppliers', 'suppliers')]
        ];
    }

    public function messages(): array
    {
        return [
            'suppliers.required' => 'Supplier name is required',
            'suppliers.string'   => 'Supplier name must be a string',
            'suppliers.min'      => 'Supplier name must greater than 2 characters',
            'suppliers.max'      => 'Supplier name must less than 255 characters',
            'suppliers.unique'   => 'Supplier name already exists',
        ];
    }
}
