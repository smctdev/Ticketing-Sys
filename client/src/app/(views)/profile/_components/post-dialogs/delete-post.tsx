import { PostData } from "@/components/post-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ButtonLoader from "@/components/ui/button-loader";
import { api } from "@/lib/api";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

interface DeletePostProps {
  id: number;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  fetchData: () => Promise<void>;
  setSelectedPost: Dispatch<SetStateAction<PostData | null>>;
  setIsOpenComment: Dispatch<SetStateAction<boolean>>;
}

export function DeletePost({
  id,
  open,
  setOpen,
  fetchData,
  setSelectedPost,
  setIsOpenComment,
}: DeletePostProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleDeletePost = async () => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/posts/${id}/delete`);

      if (response.status === 200) {
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setOpen(false);
        setError("");
        setSelectedPost(null);
        setIsOpenComment(false);
        fetchData();
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 429) {
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete all
            comments associated with this post.
          </AlertDialogDescription>
          {error && (
            <AlertDialogDescription className="text-red-500 text-xs text-center">
              {error}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <ButtonLoader
            type="button"
            onClick={handleDeletePost}
            isLoading={isLoading}
            className="bg-red-500 hover:bg-red-600"
          >
            Yes, Delete
          </ButtonLoader>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
