import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { EditComment } from "./comment-dialogs/edit-comment";
import IsEdited from "./is-edited";
import { DeleteComment } from "./comment-dialogs/delete-comment";
import diffForHumans from "@/utils/diff-for-humans";

interface Comment {
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

export default function CommentList({
  comment,
  setIsRefresh,
  setIsRefreshComment,
}: {
  comment: Comment;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  setIsRefreshComment: Dispatch<SetStateAction<boolean>>;
}) {
  const { user } = useAuth();
  const isPostOwner =
    Number(user?.login_id) === Number(comment?.user?.login_id);
  const [isShowMore, setIsShowMore] = useState<{ [key: number]: boolean }>({
    [0]: false,
  });
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({
    [0]: false,
  });
  const commentRef = useRef<HTMLSpanElement>(null);
  const [isOpenEditDialog, setIsOpenEditDialog] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<Comment>(comment);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [commentId, setCommentId] = useState<number>(0);

  useEffect(() => {
    if (commentRef.current) {
      const { scrollHeight, clientHeight } = commentRef.current;
      if (scrollHeight > clientHeight) {
        setIsShowMore({ [comment?.id]: true });
      }
    }
  }, [comment?.id]);

  const handleShowMore = () => {
    setIsExpanded({ [comment?.id]: !isExpanded[comment?.id] });
  };

  const handleOpenEditDialog = (data: Comment) => () => {
    setSelectedComment(data);
    setIsOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (id: number) => () => {
    setCommentId(id);
    setIsOpenDeleteDialog(true);
  };
  return (
    <div className="flex space-x-2 relative">
      <Avatar className="h-8 w-8 mx-3 my-1.5">
        <AvatarImage
          src={Storage(comment?.user?.user_detail?.profile_pic)}
          alt={comment?.user?.full_name}
        />
        <AvatarFallback className="font-bold dark:text-white text-gray-700">
          {nameShortHand(comment?.user?.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col px-3 py-1.5 rounded-xl w-full">
        <div className="flex items-center gap-1">
          <span className="dark:text-white text-gray-500 font-bold">
            {comment?.user?.full_name}
          </span>
          <span className="dark:text-white text-gray-500 font-bold text-[8px]">
            •
          </span>
          <small className="dark:text-white text-gray-400 text-[10.3px] italic">
            {diffForHumans(new Date(comment?.created_at))}
          </small>
          {comment?.is_edited && (
            <IsEdited date={new Date(comment?.updated_at)} />
          )}
        </div>
        <span
          ref={commentRef}
          className={`text-sm dark:text-white text-gray-600 break-all whitespace-break-spaces ${
            isExpanded[comment?.id] ? "" : "line-clamp-3"
          }`}
        >
          {comment?.comment}
        </span>
        {isShowMore[comment?.id] && (
          <Button
            type="button"
            size={"xs"}
            variant={"link"}
            className="px-0! text-blue-400 text-[10px] self-start"
            onClick={handleShowMore}
          >
            {isExpanded[comment?.id] ? "Show less" : "Show more"}
          </Button>
        )}
        {isPostOwner && (
          <div className="flex gap-2">
            <Button
              type="button"
              size={"xs"}
              variant={"link"}
              className="px-1! dark:text-white text-gray-500 text-[10px]"
              onClick={handleOpenEditDialog(comment)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size={"xs"}
              variant={"link"}
              className="px-1! dark:text-white text-gray-500 text-[10px]"
              onClick={handleOpenDeleteDialog(comment?.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {isOpenEditDialog && (
        <EditComment
          open={isOpenEditDialog}
          setOpen={setIsOpenEditDialog}
          setIsRefresh={setIsRefreshComment}
          comment={selectedComment}
        />
      )}

      {isOpenDeleteDialog && (
        <DeleteComment
          id={commentId}
          open={isOpenDeleteDialog}
          setOpen={setIsOpenDeleteDialog}
          setIsRefresh={setIsRefresh}
          setIsRefreshComment={setIsRefreshComment}
        />
      )}
    </div>
  );
}
