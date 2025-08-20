import { Badge } from "@/components/ui/badge";
import formatDateAndTime from "@/utils/format-date-and-time";
import statusColor from "@/utils/ticket-status-color";

export const TICKETS_COLUMNS = [
  {
    name: "Ticket Code",
    cell: (row: any) => row.ticket_code,
    sortable: false,
    sortField: "ticket_code",
  },
  {
    name: "Requested By",
    cell: (row: any) => row.user_login.full_name,
    sortable: false,
    sortField: "user_details.fname",
  },
  {
    name: "Category",
    cell: (row: any) => row.ticket_detail.ticket_category.category_name,
    sortable: false,
    sortField: "ticket_categories.category_name",
  },
  {
    name: "Assigned Automation",
    cell: (row: any) => row.assigned_ticket.full_name,
    sortable: false,
    sortField: "user_details.fname",
  },
  {
    name: "Approved By",
    cell: (row: any) =>
      row.approve_acctg_sup ? row.approve_acctg_sup.full_name : "-",
    sortable: false,
    sortField: "user_details.fname",
  },
  {
    name: "Created At",
    cell: (row: any) => formatDateAndTime(row?.ticket_detail?.date_created),
    sortable: false,
    sortField: "date_created",
  },
  {
    name: "Transaction Date",
    cell: (row: any) =>
      formatDateAndTime(row.ticket_detail.ticket_transaction_date),
    sortable: false,
    sortField: "ticket_transaction_date",
  },
  {
    name: "Status",
    cell: (row: any) => (
      <Badge
        variant="outline"
        className={`${statusColor(
          row.status
        )} capitalize text-[11px] font-bold`}
      >
        {row.status.toLowerCase()}
      </Badge>
    ),
    sortable: false,
    sortField: "status",
  },
];
