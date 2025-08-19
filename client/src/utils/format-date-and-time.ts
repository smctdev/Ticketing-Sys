import { formatDate } from "date-fns";

export default function formatDateAndTime(date: string) {
  return formatDate(date, "yyyy-MM-dd HH:mm a");
}
