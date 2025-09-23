import formattedDateFull from "@/utils/format-date-full";

export const TICKET_FORM_DATA = {
  ticket_transaction_date: formattedDateFull(new Date()),
  ticket_category: "",
  ticket_support: [],
  ticket_for: "",
  removed_file: [],
};
