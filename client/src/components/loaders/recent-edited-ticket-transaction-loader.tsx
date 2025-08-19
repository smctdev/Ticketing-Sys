import { Skeleton } from "../ui/skeleton";

export default function RecentEditedTicketTransactionsLoader() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
          key={index}
        >
          <div className="space-y-2">
            <Skeleton className="h-8 w-50"></Skeleton>
            <Skeleton className="h-4 w-32"></Skeleton>
          </div>
          <Skeleton className="h-9 w-24"></Skeleton>
        </div>
      ))}
    </>
  );
}
