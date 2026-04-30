import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackSkeleton() {
  return (
    <Card className="gap-0">
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-3 w-24" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}
