import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import diffForHumans from "@/utils/diff-for-humans";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Feedback } from "../page";
import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dispatch, SetStateAction } from "react";
import StarRatings from "./star-ratings";

export default function FeedbackCard({
  feedback,
  setSelectedFeedback,
  setIsDialogOpen,
}: {
  feedback: Feedback;
  setSelectedFeedback: Dispatch<SetStateAction<Feedback | null>>;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Card
      className="gap-0 relative overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => {
        setSelectedFeedback(feedback);
        setIsDialogOpen(true);
      }}
    >
      <Quote className="absolute top-4 right-4 size-8 text-muted-foreground/10" />
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarImage
              src={Storage(feedback?.profile_pic)}
              alt={feedback?.user_name}
            />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {nameShortHand(feedback?.user_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">
              {feedback?.user_name}
            </span>
            <Badge
              variant="secondary"
              className="w-fit text-[10px] px-1.5 py-0"
            >
              {feedback?.role_name}
            </Badge>
          </div>
        </div>
        <StarRatings rating={feedback.rating} />
        <p className="text-sm text-muted-foreground leading-relaxed wrap-anywhere whitespace-break-spaces line-clamp-2">
          {feedback.comment}
        </p>

        <span className="text-xs text-muted-foreground/60 mt-auto">
          {diffForHumans(new Date(feedback.created_at))}
        </span>
      </CardContent>
    </Card>
  );
}
