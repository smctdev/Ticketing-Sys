import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNowStrict } from "date-fns";
import Storage from "@/utils/storage";
import nameShortHand from "@/utils/name-short-hand";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Heart, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function PostList({ post, setisRefresh }: any) {
  const { user } = useAuth();
  const [isLoadingLike, setIsLoadingLike] = useState<{
    [key: string]: boolean;
  }>({ [0]: false });
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({
    [0]: false,
  });
  const [showSeeMore, setShowSeeMore] = useState<{ [key: string]: boolean }>({
    [0]: false,
  });
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      if (scrollHeight > clientHeight) {
        setShowSeeMore({ [post?.id]: true });
      }
    }
  }, [post?.content]);

  const handleLike = (postId: number) => async () => {
    setisRefresh(true);
    setIsLoadingLike({ [postId]: true });
    try {
      const response = await api.post(`/posts/${postId}/like-unline`);
      if (response.status === 201) {
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setisRefresh(false);
      setIsLoadingLike({ [postId]: false });
    }
  };

  const handleSeeMore = (postId: number) => () => {
    setIsExpanded({ [postId]: !isExpanded[postId] });
    setShowSeeMore({ [postId]: !showSeeMore[postId] });
  };

  return (
    <Card className="hover:border-gray-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={Storage(post.user?.user_detail?.profile_pic)}
                alt={user?.full_name}
              />
              <AvatarFallback>
                {nameShortHand(post.user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{post.user?.full_name}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNowStrict(post.created_at, {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p
          ref={textRef}
          className={`whitespace-break-spaces ${
            isExpanded[post?.id] ? "" : "line-clamp-4"
          }`}
        >
          {post.content}
        </p>
        {showSeeMore[post?.id] ? (
          <span
            onClick={handleSeeMore(post.id)}
            className="text-gray-400 font-thin text-sm cursor-pointer hover:text-gray-600"
          >
            See more
          </span>
        ) : (
          isExpanded[post?.id] && (
            <span
              onClick={handleSeeMore(post.id)}
              className="text-gray-400 font-thin text-sm cursor-pointer hover:text-gray-600"
            >
              See less
            </span>
          )
        )}
        <Separator className="my-3" />
        <div className="flex justify-between text-gray-500">
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="w-full"
              onClick={handleLike(post.id)}
              disabled={isLoadingLike[post.id]}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${
                  post?.user_likes.some(
                    (userLike: any) => userLike.login_id === user?.login_id
                  ) && "text-pink-500"
                }`}
              />
              {post.user_likes?.length > 0
                ? post.user_likes?.length
                : post?.likes?.length > 9 && "9+"}
            </Button>
          </div>
          <div className="w-full">
            <Button variant="ghost" size="sm" type="button" className="w-full">
              <MessageSquare className="h-4 w-4 mr-1" />
              {post.comments?.length > 0
                ? post.comments?.length
                : post.comments?.length > 9 && "9+"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
