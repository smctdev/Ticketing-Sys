import { formatDate } from "date-fns";
import diffForHumans from "./diff-for-humans";

export default function formattedDateAndTimeStrict(date: Date | undefined) {
  if (!date) return "";
  return `${formatDate(
    new Date(date),
    "MMMM dd, yyyy HH:mm a",
  )} | ${diffForHumans(date)}`;
}
