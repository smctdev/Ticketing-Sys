import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostLoader() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="gap-1 pb-0">
          <CardHeader className="pb-3">
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full"></Skeleton>
                <div className="space-y-2">
                  <Skeleton className="text-sm font-semibold h-5 w-46"></Skeleton>
                  <Skeleton className="text-xs dark:text-white text-gray-500 h-3 w-36"></Skeleton>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-3">
              <Skeleton className="w-full h-5"></Skeleton>
              <Skeleton className="w-96 h-5"></Skeleton>
              <Skeleton className="w-full h-5"></Skeleton>
              <Skeleton className="w-1/2 h-5"></Skeleton>
              <Skeleton className="w-full h-5"></Skeleton>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between dark:text-white text-gray-500">
              <Skeleton className="h-8 w-full mr-1"></Skeleton>
              <Skeleton className="h-8 w-full mr-1"></Skeleton>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
