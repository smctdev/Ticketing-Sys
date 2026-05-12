import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      <div className="flex items-center gap-3 px-6 py-4 border-b shadow-xl shadow-chat-background/15">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="w-24 h-3 rounded" />
          <Skeleton className="w-12 h-2.5 rounded" />
        </div>
      </div>

      <Separator className="bg-background/5" />
      <div className="flex flex-col-reverse h-full px-6 py-4">
        <div className="space-y-4">
          <div className="flex justify-start items-end gap-2">
            <div className="space-y-1">
              <Skeleton className="w-48 h-9 rounded-2xl rounded-bl-sm" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
          <div className="flex justify-start items-end gap-2">
            <div className="space-y-1">
              <Skeleton className="w-65 h-9 rounded-2xl rounded-bl-sm" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
          <div className="flex justify-end items-end gap-2">
            <div className="space-y-1 items-end flex flex-col">
              <Skeleton className="w-36 h-9 rounded-2xl rounded-br-sm" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
          <div className="flex justify-start items-end gap-2">
            <div className="space-y-1">
              <Skeleton className="w-56 h-9 rounded-2xl rounded-bl-sm" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
          <div className="flex justify-end items-end gap-2">
            <div className="space-y-1 items-end flex flex-col">
              <Skeleton className="w-44 h-9 rounded-2xl rounded-br-sm" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
          <div className="flex justify-end items-end gap-2">
            <div className="space-y-1 items-end flex flex-col">
              <Skeleton className="w-75 h-9 rounded-2xl rounded-br-sm" />
              <Skeleton className="w-10 h-2 rounded" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/5 shrink-0 flex items-center gap-3 border-b shadow-xl shadow-chat-background/15">
        <Skeleton className="flex-1 h-11 rounded-2xl" />
        <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
      </div>
    </div>
  );
}
