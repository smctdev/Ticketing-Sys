<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TicketRequest extends FormRequest
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
            'ticket_transaction_date'   => ['required', 'date', 'before_or_equal:today'],
            'ticket_category'           => ['required', Rule::exists('ticket_categories', 'ticket_category_id')],
            'ticket_support'            => ['required', 'array'],
            'ticket_support.*'          => ['file', 'max:1024'],
        ];
    }

    public function messages(): array
    {
        return [
            'ticket_support.required'    => 'At least one support file is required.',
            'ticket_support.*.file'      => 'Each support upload must be a valid file.',
            'ticket_support.*.max'       => 'Please upload a file less than 1MB.',
        ];
    }
}
