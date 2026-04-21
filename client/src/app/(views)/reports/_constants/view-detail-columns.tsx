import formatDateAndTime from "@/utils/format-date-and-time";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const VIEW_DETAIL_COMLUMNS = [
  {
    name: "TRANSACTION DATE",
    cell: (row: any) =>
      formatDateAndTime(row.ticket_detail.ticket_transaction_date),
  },
  {
    name: "TICKET CATEGORY",
    cell: (row: any) => row.ticket_detail.ticket_category.category_name,
  },
  {
    name: "TICKET SUB CATEGORY",
    cell: (row: any) => row?.ticket_detail.sub_category?.sub_category_name,
  },
  {
    name: "TICKET TYPE",
    cell: (row: any) =>
      row?.ticket_detail?.ticket_type?.replace(/_/g, " ")?.toUpperCase(),
  },
  {
    name: "REFERENCE NUMBER",
    cell: (row: any) => row.ticket_detail.td_ref_number,
  },
  {
    name: "PURPOSE",
    cell: (row: any) => row.ticket_detail.td_purpose,
  },
  {
    name: "FROM",
    cell: (row: any) => row.ticket_detail.td_from,
  },
  {
    name: "TO",
    cell: (row: any) => row.ticket_detail.td_to,
  },
  {
    name: "AUTOMATION MANAGER NOTE",
    cell: (row: any) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="truncate">{row.ticket_detail.td_note}</p>
        </TooltipTrigger>
        <TooltipContent className="max-w-[400px]">
          <div>{row.ticket_detail.td_note}</div>
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    name: "AUTOMATION NOTE",
    cell: (row: any) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="truncate">{row.ticket_detail.td_note_bh}</p>
        </TooltipTrigger>
        <TooltipContent className="max-w-[400px]">
          <div>{row.ticket_detail.td_note_bh}</div>
        </TooltipContent>
      </Tooltip>
    ),
  },
  {
    name: "BRANCH",
    cell: (row: any) => row.branch_name,
  },
  {
    name: "REQUESTED BY",
    cell: (row: any) => row.user_login?.full_name || "Deleted Account",
  },
  {
    name: "APPROVED BY BRANCH HEAD",
    cell: (row: any) => row.approve_by_head?.full_name,
  },
  {
    name: "APPROVED BY ACCOUNTING",
    cell: (row: any) => row.approve_by_acctg_sup?.full_name,
  },
  {
    name: "APPROVED BY ACCOUNTING STAFF",
    cell: (row: any) => row.approve_by_acctg_staff?.full_name,
  },
  {
    name: "EDITED BY",
    cell: (row: any) => row.edited_by?.full_name,
  },
  {
    name: "DATE EDITED",
    cell: (row: any) => formatDateAndTime(row.ticket_detail.date_completed),
  },
];
