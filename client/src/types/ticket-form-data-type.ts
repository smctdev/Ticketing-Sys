export interface TicketFormDataType {
  ticket_transaction_date: string;
  ticket_category: string;
  ticket_support: any[];
  ticket_for?: string;
  removed_file?: any[];
  ticket_type?: string;
  purpose?: string;
  from?: string;
  to?: string;
  ticket_sub_category?: string;
  ticket_reference_number?: string;
  branch_head_id?: string;
  for_branch?: string;
}
