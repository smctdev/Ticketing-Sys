import formatDateAndTime from "@/utils/format-date-and-time";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import CarouselLayout from "@/components/carousel-layout";
import { Button } from "@/components/ui/button";

export const VIEW_DETAIL_COMLUMNS = [
  {
    name: "TICKET CODE",
    cell: (row: any) => (
      <button
        type="button"
        className="text-blue-500 hover:text-blue-600 hover:underline font-bold"
      >
        {row.ticket_code}
      </button>
    ),
  },
  {
    name: "ATTACHMENTS",
    cell: (row: any) =>
      row.ticket_detail.td_support.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Eye className="h-4 w-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
          </DialogTrigger>
          <DialogContent
            showCloseButton={false}
            className="bg-transparent border-none shadow-none sm:!max-w-sm md:!max-w-md lg:!max-w-lg xl:!max-w-xl 2xl:!max-w-2xl !h-fit"
          >
            <div className="p-10">
              <CarouselLayout images={row.ticket_detail.td_support} />
            </div>
          </DialogContent>
        </Dialog>
      ),
  },
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
    name: "NOTE",
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
    name: "BRANCH",
    cell: (row: any) => row.branch_name,
  },
  {
    name: "REQUESTED BY",
    cell: (row: any) => row.user_login?.full_name,
  },
  {
    name: "APPROVED BY BRANCH HEAD",
    cell: (row: any) => row.approve_head?.full_name,
  },
  {
    name: "APPROVED BY ACCOUNTING",
    cell: (row: any) => row.approve_acctg_sup?.full_name,
  },
  {
    name: "APPROVED BY ACCOUNTING STAFF",
    cell: (row: any) => row.approve_acctg_staff?.full_name,
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
