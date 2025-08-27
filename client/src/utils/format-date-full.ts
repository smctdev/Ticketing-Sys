import { formatDate } from "date-fns";

export default function formattedDateFull(date: Date | undefined) {
  if (!date) return "";
  return formatDate(new Date(date), "MMMM dd, yyyy");
}
