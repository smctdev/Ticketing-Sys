<?php

namespace App\Http\Requests;

use App\Enums\UserRoles;
use App\Models\TicketCategory;
use App\Models\UserLogin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateTicketRequest extends FormRequest
{
    private function branchHeads()
    {
        $ids = explode(',', Auth::user()->blist_id);

        return UserLogin::query()
            ->where(function ($query) use ($ids) {
                $query->whereRelation('userRole', 'role_name', UserRoles::BRANCH_HEAD)
                    ->whereNot('login_id', Auth::id())
                    ->where(function ($sQ) use ($ids) {
                        foreach ($ids as $id) {
                            $sQ->orWhereRaw('FIND_IN_SET(?, blist_id)', [$id]);
                        }
                    });
            })
            ->count();
    }

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
            'ticket_transaction_date' => ['required', 'date', 'before_or_equal:today'],
            'ticket_category'         => ['required', Rule::exists('ticket_categories', 'ticket_category_id')],
            'ticket_type'             => ['nullable'],
            'purpose'                 => ['required', 'max:1000', 'min:2'],
            'from'                    => ['required', 'max:255', 'min:2'],
            'to'                      => ['required', 'max:255', 'min:2'],
            'ticket_reference_number' => ['required_if:ticket_type,sql_ticket', 'max:255', 'min:2'],
            'branch_head_id'          => [Rule::requiredIf($this->branchHeads() > 1)]
        ];
    }

    public function messages(): array
    {
        return [
            'purpose.required_if'                 => 'Purpose is required.',
            'purpose.max'                         => 'Purpose must be less than 255 characters.',
            'purpose.min'                         => 'Purpose must be at least 2 characters.',
            'from.required_if'                    => 'From is required.',
            'from.max'                            => 'From must be less than 255 characters.',
            'from.min'                            => 'From must be at least 2 characters.',
            'to.required_if'                      => 'To is required.',
            'to.max'                              => 'To must be less than 255 characters.',
            'to.min'                              => 'To must be at least 2 characters.',
            'ticket_reference_number.required_if' => 'Ticket reference number is required.',
            'ticket_reference_number.max'         => 'Ticket reference number must be less than 255 characters.',
            'ticket_reference_number.min'         => 'Ticket reference number must be at least 2 characters.',
            'branch_head_id.required_if'          => 'Branch head is required.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $ticketCategory = TicketCategory::with('subCategories')->where('ticket_category_id', $this->ticket_category)->first();
            $selected_branch_head = UserLogin::query()
                ->with('userRole')
                ->where('login_id', $this->branch_head_id)
                ->first();

            if ($ticketCategory && $ticketCategory->subCategories()->count() > 0) {
                if (!$this->ticket_sub_category) {
                    $validator->errors()->add('ticket_sub_category', 'The ticket sub category is required.');
                }
            }

            if ($selected_branch_head?->userRole?->role_name !== UserRoles::BRANCH_HEAD && $this->branchHeads() > 1) {
                $validator->errors()->add('branch_head_id', 'Selected user is not a Branch Head. Please Select Another Branch Head.');
            }
        });
    }
}
