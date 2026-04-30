"use client";

import { useSimple } from "@/hooks/use-simple";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { MessageSquareQuote } from "lucide-react";
import { AddFeedback } from "./_components/add-feedback";
import { useEffect, useState } from "react";
import FeedbackCard from "./_components/feedback-card";
import FeedbackSkeleton from "./_components/feedback-skeleton";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import StarRatings from "./_components/star-ratings";

export type Feedback = {
  id: number;
  comment: string;
  rating: number;
  created_at: string;
  user_name: string;
  profile_pic?: string;
  role_name: string;
};

function Feedbacks() {
  const { data, isLoading, handleNextPage, loadMore } = useSimple("/feedbacks");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );

  useEffect(() => {
    if (data?.data) {
      setFeedbacks((prev) => [
        ...prev,
        ...data?.data?.filter(
          (item: any) => !prev.some((p) => p.id === item.id),
        ),
      ]);
    }
  }, [data]);

  const hasMore = !!data?.next_page_url;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="size-5 text-muted-foreground" />
          <h1 className="text-lg font-bold text-gray-600 dark:text-white">
            Feedbacks
          </h1>
          {!isLoading && feedbacks.length > 0 && (
            <Badge variant="secondary">{data?.total ?? feedbacks.length}</Badge>
          )}
          <div className="ml-auto">
            <AddFeedback setFeedbacks={setFeedbacks} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeedbackSkeleton key={i} />
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <MessageSquareQuote className="size-12 text-muted-foreground/40" />
              </EmptyMedia>
              <EmptyTitle>No feedbacks yet</EmptyTitle>
              <EmptyDescription>
                Feedbacks submitted by users will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {feedbacks.map((feedback) => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  setSelectedFeedback={setSelectedFeedback}
                  setIsDialogOpen={setIsDialogOpen}
                />
              ))}
              {loadMore &&
                Array.from({ length: 3 }).map((_, i) => (
                  <FeedbackSkeleton key={i} />
                ))}
            </div>

            {hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={loadMore}
                >
                  {loadMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          setSelectedFeedback(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFeedback?.user_name}&apos;s Feedback
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <Badge
                variant="secondary"
                className="w-fit text-[10px] px-1.5 py-0"
              >
                {selectedFeedback?.role_name}
              </Badge>
              <StarRatings rating={selectedFeedback?.rating || 0} />
            </DialogDescription>
            <div className="wrap-anywhere whitespace-break-spaces text-sm text-muted-foreground max-h-[50vh] overflow-y-auto">
              {selectedFeedback?.comment}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default withAuthPage(Feedbacks);
