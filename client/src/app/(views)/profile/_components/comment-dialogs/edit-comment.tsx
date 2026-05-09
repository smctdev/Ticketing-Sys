import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/ui/button-loader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { api } from "@/lib/api";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { toast } from "sonner";

interface EditCommentProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  fetchComments: () => Promise<void>;
  comment: {
    comment: string;
    id: number;
  };
}

export function EditComment({
  open,
  setOpen,
  fetchComments,
  comment,
}: EditCommentProps) {
  const { user } = useAuth();
  const [commentValue, setCommentValue] = useState<string>(comment?.comment);
  const [errors, setErrors] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUpdateComment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.patch(`/comments/${comment?.id}/update`, {
        comment: commentValue,
      });

      if (response.status === 200) {
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        setOpen(false);
        fetchComments();
      }
    } catch (error: any) {
      console.error(error.response.data.errors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleUpdateComment} className="space-y-3">
          <DialogHeader>
            <DialogTitle>Edit comment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
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
                    value={commentValue}
                    onChange={(e) =>
                      setCommentValue(
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
                        commentValue.length >= 500
                          ? "text-red-500"
                          : "dark:text-white text-gray-400"
                      } text-xs`}
                    >
                      {commentValue.length}/500
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <ButtonLoader
              isLoading={isLoading}
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Update
            </ButtonLoader>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
