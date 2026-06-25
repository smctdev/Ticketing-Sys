import { CreatePost } from "@/app/(views)/profile/_components/post-dialogs/create-post";
import ButtonLoader from "./ui/button-loader";
import PostLoader from "@/app/(views)/profile/_components/post-loader";
import PostList from "@/app/(views)/profile/_components/post-list";
import {
  Comment,
  PostComment,
} from "@/app/(views)/profile/_components/post-comment";
import { EditPost } from "@/app/(views)/profile/_components/post-dialogs/edit-post";
import { DeletePost } from "@/app/(views)/profile/_components/post-dialogs/delete-post";
import { CursorType } from "@/hooks/use-fetch-cursor";
import { RefObject, useState } from "react";

export interface User {
  login_id: number;
  user_detail: {
    profile_pic: string;
  };
  full_name: string;
  username: string;
}

export interface PostData {
  id: number;
  user: User;
  content: string;
  category: string;
  comments_count: number;
  user_likes_count: number;
  is_liked_by_you: boolean;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  latest_comment: Comment;
}

export interface PostItemProps {
  data: PostData[];
  isLoading: boolean;
  cursor: CursorType;
  fetchData: () => Promise<void>;
  handleCursor: (title: "next" | "prev") => () => void;
  scrollToTopRef: RefObject<HTMLDivElement | null>;
}

export default function PostItem({
  data,
  isLoading,
  cursor,
  fetchData,
  handleCursor,
  scrollToTopRef,
}: PostItemProps) {
  const [isOpenComment, setIsOpenComment] = useState<boolean>(false);
  const [isOpenEditPostDialog, setIsOpenEditPostDialog] =
    useState<boolean>(false);
  const [isOpenDeletePostDialog, setIsOpenDeletePostDialog] =
    useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [postId, setPostId] = useState<number>(0);

  const handleComment = (data: PostData) => () => {
    setIsOpenComment(true);
    setSelectedPost(data);
  };

  const handleEditPost = (data: PostData) => () => {
    setIsOpenEditPostDialog(!isOpenEditPostDialog);
    setSelectedPost(data);
  };

  const handleDeletePost = (id: number) => () => {
    setIsOpenDeletePostDialog(!isOpenDeletePostDialog);
    setPostId(id);
  };
  return (
    <div className="lg:col-span-2 w-full space-y-3" ref={scrollToTopRef}>
      <CreatePost fetchData={fetchData} />
      {cursor?.prev_cursor && (
        <div className="flex justify-center">
          <ButtonLoader
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleCursor("prev")}
            isLoading={isLoading}
          >
            Load new post
          </ButtonLoader>
        </div>
      )}
      {isLoading ? (
        <PostLoader />
      ) : data?.length > 0 ? (
        data.map((post: any, index: number) => (
          <PostList
            key={index}
            post={post}
            fetchData={fetchData}
            handleEditPost={handleEditPost}
            handleDeletePost={handleDeletePost}
            handleComment={handleComment}
            setSelectedPost={setSelectedPost}
          />
        ))
      ) : (
        <p className="dark:text-white text-gray-500 w-full text-center text-xl font-bold mt-10">
          No posts yet
        </p>
      )}
      <div className="flex justify-center">
        {cursor?.next_cursor ? (
          <ButtonLoader
            isLoading={isLoading}
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={handleCursor("next")}
          >
            Load more post
          </ButtonLoader>
        ) : (
          data?.length > 0 && (
            <span className="dark:text-white text-gray-400">
              All posts loaded
            </span>
          )
        )}
      </div>

      {isOpenComment && (
        <PostComment
          data={selectedPost}
          fetchData={fetchData}
          open={isOpenComment}
          setOpen={setIsOpenComment}
          handleEditPost={handleEditPost}
          handleDeletePost={handleDeletePost}
          handleComment={handleComment}
          setSelectedPost={setSelectedPost}
        />
      )}

      {isOpenEditPostDialog && (
        <EditPost
          open={isOpenEditPostDialog}
          setOpen={setIsOpenEditPostDialog}
          data={selectedPost}
          fetchData={fetchData}
          setSelectedPost={setSelectedPost}
        />
      )}

      {isOpenDeletePostDialog && (
        <DeletePost
          id={postId}
          open={isOpenDeletePostDialog}
          setOpen={setIsOpenDeletePostDialog}
          fetchData={fetchData}
          setSelectedPost={setSelectedPost}
          setIsOpenComment={setIsOpenComment}
        />
      )}
    </div>
  );
}
