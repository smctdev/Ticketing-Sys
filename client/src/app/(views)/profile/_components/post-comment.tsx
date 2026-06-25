import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import PostList from "./post-list";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useFetchCursor } from "@/hooks/use-fetch-cursor";
import CommentList from "./comment-list";
import { MessageCircleOff, SendHorizonal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Storage from "@/utils/storage";
import nameShortHand from "@/utils/name-short-hand";
import CommentLoader from "./comment-loader";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PostData } from "@/components/post-item";

export interface Comment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  user: {
    full_name: string;
    user_detail: {
      profile_pic: string;
    };
    login_id: number;
  };
}

export function PostComment({
  data,
  open,
  setOpen,
  fetchData,
  handleEditPost,
  handleDeletePost,
  handleComment,
  setSelectedPost,
}: {
  data: any;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  fetchData: () => Promise<void>;
  handleEditPost: (data: PostData) => () => void;
  handleDeletePost: (id: number) => () => void;
  handleComment: (data: PostData) => () => void;
  setSelectedPost: Dispatch<SetStateAction<PostData | null>>;
}) {
  const { user } = useAuth();
  const {
    data: comments,
    isLoading,
    fetchData: fetchComments,
    handleCursor,
    cursor,
  } = useFetchCursor({ url: `/comments/${data?.id}/comments` });
  const [comment, setComment] = useState<string>("");
  const [errors, setErrors] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmitComment = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/comments", {
        post_id: data?.id,
        comment,
      });
      if (response.status === 201) {
        setComment("");
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        textareaRef.current?.focus();
        fetchData();
        fetchComments();
        setSelectedPost((prev) => ({
          ...prev!,
          comments_count: prev!.comments_count + 1,
        }));
      }
    } catch (error: any) {
      console.error(error);
      setErrors(error.response.data.errors);
      if (error.response.status == 429) {
        toast.error("Too many requests", {
          description: "Please try again later",
          position: "bottom-center",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentChange = () => {
    textareaRef.current?.focus();
  };

  if (!data) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setSelectedPost(null);
        }
      }}
    >
      <DialogContent className="px-0 pb-0 min-w-2/5">
        <DialogHeader className="mx-5">
          <DialogTitle className="dark:text-white text-gray-600 font-bold text-xl text-center">
            {data?.user?.full_name}&apos;s post
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <PostList
            post={data}
            fetchData={fetchData}
            isCommentOpen={open}
            handleCommentChange={handleCommentChange}
            handleEditPost={handleEditPost}
            handleDeletePost={handleDeletePost}
            handleComment={handleComment}
            setSelectedPost={setSelectedPost}
          />
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <CommentLoader />
            ) : comments?.length > 0 ? (
              <div className="max-h-[calc(60vh-200px)] overflow-y-auto">
                {cursor?.prev_cursor && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant={"link"}
                      className="dark:text-white text-gray-500"
                      size="xs"
                      onClick={handleCursor("prev")}
                    >
                      Load new comments
                    </Button>
                  </div>
                )}
                <div className="space-y-2 p-4">
                  {comments?.map((comment: Comment, index: number) => (
                    <CommentList
                      key={index}
                      comment={comment}
                      fetchData={fetchData}
                      fetchComments={fetchComments}
                    />
                  ))}
                </div>
                {cursor?.next_cursor ? (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant={"link"}
                      className="dark:text-white text-gray-500"
                      size="xs"
                      onClick={handleCursor("next")}
                    >
                      Load more comments
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <small className="dark:text-white text-gray-400 text-xs">
                      All comments loaded
                    </small>
                  </div>
                )}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MessageCircleOff />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm">No comments yet</EmptyTitle>
                  <EmptyDescription className="text-xs">
                    Post a comment to this post
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCommentChange}
                  >
                    Submit comment
                  </Button>
                </EmptyContent>
              </Empty>
            )}
          </div>
        </div>
        <div className="flex p-2 gap-1">
          <Avatar className="h-8 w-8 self-end">
            <AvatarImage
              src={Storage(user?.user_detail?.profile_pic)}
              alt={user?.full_name}
            />
            <AvatarFallback className="font-bold dark:text-white text-gray-700">
              {nameShortHand(user?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            {errors?.comment && (
              <small className="text-red-500 text-xs">
                {errors.comment[0]}
              </small>
            )}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value.length > 500
                      ? e.target.value.slice(0, 500)
                      : e.target.value,
                  )
                }
                className={`max-h-26 resize-none break-all ${
                  errors?.comment && "border-red-500"
                }`}
                placeholder={`Comment as ${user?.full_name}`}
              />
              <div className="absolute bottom-1 right-4">
                <small
                  className={`${
                    comment.length >= 500
                      ? "text-red-500"
                      : "dark:text-white text-gray-400"
                  } text-xs`}
                >
                  {comment.length}/500
                </small>
              </div>
            </div>
          </div>
          <Button
            className="self-end"
            type="button"
            onClick={handleSubmitComment}
            variant={"ghost"}
            disabled={isSubmitting || !comment}
          >
            <SendHorizonal />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
