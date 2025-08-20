import formattedDate from "@/utils/format-date";

export const TICKETS_FILTER = {
  status: "ALL",
  search: "",
  defaultSearchValue: "",
};

export const REPORTS_FILTER = {
  branch_code: "ALL",
  ticket_category: "ALL",
  branch_type: "ALL",
  edited_start_date: formattedDate(new Date()),
  edited_end_date: formattedDate(new Date()),
  edited_transaction_start_date: "",
  edited_transaction_end_date: "",
};
