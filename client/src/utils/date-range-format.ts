import { format } from "date-fns";

export function dateRangeFormat(date: Date) {
  return format(new Date(date), "LLL dd, y");
}
