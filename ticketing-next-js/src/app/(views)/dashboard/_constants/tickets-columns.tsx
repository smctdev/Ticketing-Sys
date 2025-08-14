import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import formatDateAndTime from "@/utils/format-date-and-time";
import statusColor from "@/utils/ticket-status-color";
import { Eye, Pencil, Trash } from "lucide-react";

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
    name: "Automation",
    cell: (row: any) => row.assigned_ticket.full_name,
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
  {
    name: "Action",
    cell: (row: any) => (
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="border-none bg-transparent shadow-none hover:scale-105"
        >
          <Eye className="h-4 w-4 text-green-500 hover:text-green-600" />
        </button>
        <button
          type="button"
          className="border-none bg-transparent shadow-none hover:scale-105"
        >
          <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-600" />
        </button>
        <button
          type="button"
          className="border-none bg-transparent shadow-none hover:scale-105"
        >
          <Trash className="h-4 w-4 text-red-500 hover:text-red-600" />
        </button>
      </div>
    ),
  },
];
