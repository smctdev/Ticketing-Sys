import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNowStrict } from "date-fns";
import Storage from "@/utils/storage";
import nameShortHand from "@/utils/name-short-hand";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Heart, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { PostDropdown } from "./post-dropdown";
import IsEdited from "./is-edited";
import { ROLE } from "@/constants/roles";
import Link from "next/link";
import { PostData } from "@/components/post-item";
import CommentList from "./comment-list";

interface PostListProps {
  post: PostData;
  fetchData: () => Promise<void>;
  isCommentOpen?: boolean;
  handleCommentChange?: () => void;
  handleEditPost: (data: PostData) => () => void;
  handleDeletePost: (id: number) => () => void;
  handleComment: (data: PostData) => () => void;
  setSelectedPost: Dispatch<SetStateAction<PostData | null>>;
}

export default function PostList({
  post,
  fetchData,
  isCommentOpen,
  handleCommentChange,
  handleEditPost,
  handleDeletePost,
  handleComment,
  setSelectedPost,
}: PostListProps) {
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
  const isPostowner = Number(user?.login_id) === Number(post?.user?.login_id);
  const textRef = useRef<HTMLParagraphElement>(null);
  const IS_SUPER_ADMIN = user?.user_role?.role_name === ROLE.SUPER_ADMIN;

  useEffect(() => {
    if (textRef.current) {
      const { scrollHeight, clientHeight } = textRef.current;
      if (scrollHeight > clientHeight) {
        setShowSeeMore({ [post?.id]: true });
      }
    }
  }, [post?.content]);

  const handleLike = (postId: number) => async () => {
    setIsLoadingLike({ [postId]: true });
    try {
      const response = await api.post(`/posts/${postId}/like-unline`);
      if (response.status === 201) {
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setSelectedPost(response.data.data);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingLike({ [postId]: false });
    }
  };

  const handleSeeMore = (postId: number) => () => {
    setIsExpanded({ [postId]: !isExpanded[postId] });
    setShowSeeMore({ [postId]: !showSeeMore[postId] });
  };

  return (
    <>
      <Card className="hover:border-gray-300 hover:dark:border-gray-600 hover:shadow-lg gap-0 pb-0">
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={Storage(post.user?.user_detail?.profile_pic)}
                  alt={user?.full_name}
                />
                <AvatarFallback className="font-bold dark:text-white text-gray-700">
                  {nameShortHand(post.user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="flex items-center gap-1">
                  <span className="text-sm font-semibold">
                    {post.user?.full_name}
                  </span>
                  <span className="dark:text-white text-gray-400">-</span>
                  <span className="text-xs dark:text-white text-gray-500">
                    {post?.category}
                  </span>
                </p>
                <p className="text-blue-400 text-xs">{`@${post?.user?.username}`}</p>
                <p className="text-xs dark:text-white text-gray-500 flex items-center gap-1">
                  {formatDistanceToNowStrict(post.created_at, {
                    addSuffix: true,
                  })}
                  {post?.is_edited && (
                    <IsEdited date={new Date(post?.updated_at)} />
                  )}
                </p>
              </div>
            </div>
            {(isPostowner || IS_SUPER_ADMIN) && (
              <PostDropdown
                handleEditPost={handleEditPost(post)}
                handleDeletePost={handleDeletePost(post?.id)}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p
            ref={textRef}
            className={`whitespace-break-spaces wrap-break-word ${
              isExpanded[post?.id] ? "" : "line-clamp-4"
            }`}
          >
            {post?.content?.split("\n").map((word, index) => (
              <span key={index}>
                {word?.split(" ")?.map((w, idx) =>
                  w.startsWith("#") ? (
                    <Link
                      // href={`/posts/hashtag/${w.slice(1)}`}
                      href={`#`}
                      className="text-blue-400 hover:underline cursor-pointer"
                      key={idx}
                    >
                      {`${w} `}
                    </Link>
                  ) : (
                    <span key={idx}>{`${w} `}</span>
                  ),
                )}
                <br />
              </span>
            ))}
          </p>
          {showSeeMore[post?.id] ? (
            <span
              onClick={handleSeeMore(post.id)}
              className="dark:text-white text-gray-400 font-bold text-xs cursor-pointer hover:dark:text-white"
            >
              See more
            </span>
          ) : (
            isExpanded[post?.id] && (
              <span
                onClick={handleSeeMore(post.id)}
                className="dark:text-white text-gray-400 font-bold text-xs cursor-pointer hover:dark:text-white"
              >
                See less
              </span>
            )
          )}
          <Separator className="my-2" />
          <div className="flex justify-between dark:text-white text-gray-500">
            <div className="w-full">
              <Button
                variant="ghost"
                size="lg"
                type="button"
                className="w-full"
                onClick={handleLike(post.id)}
                disabled={isLoadingLike[post.id]}
              >
                <Heart
                  className={`h-4 w-4 mr-1 ${
                    post?.is_liked_by_you && "text-pink-500"
                  }`}
                />
                {post?.user_likes_count > 0
                  ? post?.user_likes_count
                  : post?.user_likes_count > 9 && "9+"}
              </Button>
            </div>
            <div className="w-full">
              <Button
                variant="ghost"
                size="lg"
                type="button"
                className="w-full"
                onClick={
                  isCommentOpen ? handleCommentChange : handleComment(post)
                }
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {Number(post.comments_count) > 0
                  ? Number(post.comments_count)
                  : Number(post.comments_count) > 9 && "9+"}
              </Button>
            </div>
          </div>
          {!isCommentOpen && post?.latest_comment && (
            <>
              <Separator className="my-2" />
              <CommentList
                comment={post?.latest_comment}
                fetchData={fetchData}
                fetchComments={fetchData}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
