import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { PostComment } from "./post-comment";
import { PostDropdown } from "./post-dropdown";
import IsEdited from "./is-edited";
import { EditPost } from "./post-dialogs/edit-post";
import { DeletePost } from "./post-dialogs/delete-post";
import { ROLE } from "@/constants/roles";

interface User {
  login_id: number;
  user_detail: {
    profile_pic: string;
  };
  full_name: string;
  username: string;
}
interface Post {
  id: number;
  user: User;
  content: string;
  category: string;
  comments_count: number;
  user_likes: any[];
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}
interface PostListProps {
  post: Post;
  fetchData: () => Promise<void>;
  isCommentOpen?: boolean;
  handleCommentChange?: () => void;
}

export default function PostList({
  post,
  fetchData,
  isCommentOpen,
  handleCommentChange,
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
  const [isOpenComment, setIsOpenComment] = useState<boolean>(false);
  const [isOpenEditPostDialog, setIsOpenEditPostDialog] =
    useState<boolean>(false);
  const [isOpenDeletePostDialog, setIsOpenDeletePostDialog] =
    useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<Post>(post);
  const [postId, setPostId] = useState<number>(0);
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

  const handleComment = () => {
    setIsOpenComment(true);
  };

  const handleEditPost = (data: Post) => () => {
    setIsOpenEditPostDialog(!isOpenEditPostDialog);
    setSelectedPost(data);
  };

  const handleDeletePost = (id: number) => () => {
    setIsOpenDeletePostDialog(!isOpenDeletePostDialog);
    setPostId(id);
  };

  return (
    <>
      <Card className="hover:border-gray-300 hover:shadow-lg">
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
            className={`whitespace-break-spaces break-all ${
              isExpanded[post?.id] ? "" : "line-clamp-4"
            }`}
          >
            {post?.content?.split("\n").map((word, index) => (
              <span key={index}>
                {word?.split(" ")?.map((w, idx) =>
                  w.startsWith("#") ? (
                    <span
                      className="text-blue-400 hover:underline cursor-pointer"
                      key={idx}
                    >
                      {`${w} `}
                    </span>
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
              className="dark:text-white text-gray-400 font-thin text-sm cursor-pointer hover:dark:text-white"
            >
              See more
            </span>
          ) : (
            isExpanded[post?.id] && (
              <span
                onClick={handleSeeMore(post.id)}
                className="dark:text-white text-gray-400 font-thin text-sm cursor-pointer hover:dark:text-white"
              >
                See less
              </span>
            )
          )}
          <Separator className="my-3" />
          <div className="flex justify-between dark:text-white text-gray-500">
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
                      (userLike: any) => userLike.login_id === user?.login_id,
                    ) && "text-pink-500"
                  }`}
                />
                {post.user_likes?.length > 0
                  ? post.user_likes?.length
                  : post?.user_likes?.length > 9 && "9+"}
              </Button>
            </div>
            <div className="w-full">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="w-full"
                onClick={isCommentOpen ? handleCommentChange : handleComment}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {Number(post.comments_count) > 0
                  ? Number(post.comments_count)
                  : Number(post.comments_count) > 9 && "9+"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isOpenComment && (
        <PostComment
          data={post}
          fetchData={fetchData}
          open={isOpenComment}
          setOpen={setIsOpenComment}
          isCommentOpen={isOpenComment}
        />
      )}

      {isOpenEditPostDialog && (
        <EditPost
          open={isOpenEditPostDialog}
          setOpen={setIsOpenEditPostDialog}
          fetchData={fetchData}
          data={selectedPost}
        />
      )}

      {isOpenDeletePostDialog && (
        <DeletePost
          id={postId}
          open={isOpenDeletePostDialog}
          setOpen={setIsOpenDeletePostDialog}
          fetchData={fetchData}
        />
      )}
    </>
  );
}
