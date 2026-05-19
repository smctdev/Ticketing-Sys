<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'login_id'                    => $this->login_id,
            'ticket_id'                   => $this->ticket_id,
            'ticket_details_id'           => $this->ticket_details_id,
            'ticket_code'                 => $this->ticket_code,
            'status'                      => $this->status,
            'branch_id'                   => $this->branch_id,
            'assigned_person'             => !$this->assignedPerson ? null : [
                'login_id'                => $this->assignedPerson->login_id,
                'full_name'               => $this->assignedPerson->full_name,
            ],
            'ticket_detail'               => !$this->ticketDetail ? null : [
                'ticket_details_id'       => $this->ticketDetail->ticket_details_id,
                'ticket_type'             => $this->ticketDetail->ticket_type,
                'ticket_transaction_date' => $this->ticketDetail->ticket_transaction_date,
                'td_ref_number'           => $this->ticketDetail->td_ref_number,
                'td_from'                 => $this->ticketDetail->td_from,
                'td_to'                   => $this->ticketDetail->td_to,
                'td_purpose'              => $this->ticketDetail->td_purpose,
                'td_note'                 => $this->ticketDetail->td_note,
                'td_note_bh'              => $this->ticketDetail->td_note_bh,
                'td_note_accounting'      => $this->ticketDetail->td_note_accounting,
                'td_support'              => $this->ticketDetail->td_support,
                'ticket_category_id'      => $this->ticketDetail->ticketCategory->ticket_category_id,
                'sub_category_id'         => $this->ticketDetail?->subCategory?->id,
                'ticket_category'         => !$this->ticketDetail->ticketCategory ? null : [
                    'category_name'       => $this->ticketDetail->ticketCategory->category_name
                ],
                'date_created'            => $this->ticketDetail->date_created,
                'sub_category'            => !$this->ticketDetail?->subCategory ? null : [
                    'sub_category_name'   => $this->ticketDetail?->subCategory?->sub_category_name
                ]
            ],
            'displayTicket'               => $this->displayTicket,
            'user_login'                  => !$this->userLogin ? null : [
                'login_id'                => $this->userLogin->login_id,
                'full_name'               => $this->userLogin->full_name,
                'branch'                  => !$this->userLogin->branch ? null : [
                    'b_name'              => $this->userLogin->branch->b_name,
                    'b_code'              => $this->userLogin->branch->b_code,
                ],
            ],
            'branch'                      => !$this->branch ? null : [
                'b_name'                  => $this->branch->b_name,
                'b_code'                  => $this->branch->b_code,
            ],
            'pending_user'                => !$this->pendingUser ? null : [
                'login_id'                => $this->pendingUser->login_id,
                'full_name'               => $this->pendingUser->full_name,
                'user_role'               => !$this->pendingUser->userRole ? null : [
                    'role_name'           => $this->pendingUser->userRole->role_name
                ],
                'user_detail'             => !$this->pendingUser->userDetail ? null : [
                    'user_email'          => $this->pendingUser->userDetail->user_email,
                    'profile_pic'         => $this->pendingUser->userDetail->profile_pic,
                ],
                'branch'                  => !$this->pendingUser->branch ? null : [
                    'b_name'              => $this->pendingUser->branch->b_name,
                    'b_code'              => $this->pendingUser->branch->b_code,
                ],
                'branches'                => $this->pendingUser->branches,
            ],
            'approve_by_head'             => !$this?->approveByHead ? null : [
                'login_id'                => $this?->approveByHead?->login_id,
                'full_name'               => $this?->approveByHead?->full_name,
            ],
            'approve_by_acctg_staff'      => !$this?->approveByAcctgStaff ? null : [
                'full_name'               => $this?->approveByAcctgStaff?->full_name,
            ],
            'approve_by_acctg_sup'        => !$this?->approveByAcctgSup ? null : [
                'full_name'               => $this?->approveByAcctgSup?->full_name,
            ],
            'edited_by'                   => !$this?->editedBy ? null : [
                'full_name'               => $this->editedBy->full_name,
            ],
            'last_approver'               => !$this?->lastApprover ? null : [
                'full_name'               => $this->lastApprover->full_name,
            ],
        ];
    }
}
