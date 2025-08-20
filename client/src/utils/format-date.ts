import { formatDate } from "date-fns";

export default function formattedDate(date: Date) {
  if (!date) return;
  return formatDate(new Date(date), "yyyy-MM-dd");
}
