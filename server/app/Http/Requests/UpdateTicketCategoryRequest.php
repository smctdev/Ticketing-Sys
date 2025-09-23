<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketCategoryRequest extends FormRequest
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
            'category_shortcut' => ['required', 'string', 'min:2', 'max:255', Rule::unique('ticket_categories', 'category_shortcut')->ignore($this->ticket_category, 'ticket_category_id')],
            'category_name'     => ['required', 'string', 'min:2', 'max:255', Rule::unique('ticket_categories', 'category_name')->ignore($this->ticket_category, 'ticket_category_id')],
            'group_code'        => ['required'],
            'show_hide'         => ['required'],
            'other_category'    => ['required_if:group_code,others', 'string', 'min:2', 'max:255', Rule::unique('group_categories', 'group_code')->ignore($this->ticket_category, 'group_code')],
        ];
    }
}
