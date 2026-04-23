import { differenceInSeconds, formatDistanceToNowStrict } from "date-fns";

export default function diffForHumans(date: Date) {
  return differenceInSeconds(new Date(), new Date(date)) < 1
    ? "Just now"
    : formatDistanceToNowStrict(new Date(date), {
        addSuffix: true,
      });
}
