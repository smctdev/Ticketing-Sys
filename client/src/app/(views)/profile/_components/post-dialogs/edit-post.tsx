import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { PostFormInputType } from "../../_types/form-input-type";
import { POST_FORM_ITEMS } from "../../_constants/form-input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import SelectableFeelings from "./selectable-feelings";
import { Post } from "../post-list";

export function EditPost({
  open,
  setOpen,
  data,
  fetchData,
  setSelectedPost,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: Post | null;
  fetchData: () => Promise<void>;
  setSelectedPost: Dispatch<SetStateAction<Post | null>>;
}) {
  const [formInput, setFormInput] =
    useState<PostFormInputType>(POST_FORM_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>(null);

  useEffect(() => {
    if (!data) return;

    setFormInput(
      (prev): PostFormInputType => ({
        ...prev,
        content: data.content,
        category: data.category,
      }),
    );
  }, [data]);

  const handleUpdatePost = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/posts/${data?.id}/update`, formInput);

      if (response.status === 200) {
        setFormInput(POST_FORM_ITEMS);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        setOpen(false);
        setSelectedPost(response.data.post);
        fetchData();
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 422) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <SelectableFeelings
              setFormInput={setFormInput}
              formInput={formInput}
            />
            {errors?.category && (
              <small className="text-red-500">{errors?.category[0]}</small>
            )}
          </div>
          <div className="grid gap-3">
            <Textarea
              placeholder="What's on your mind?"
              className="resize-none shadow max-h-46"
              value={formInput.content}
              onChange={(e) =>
                setFormInput((prev) => ({
                  ...prev,
                  content:
                    e.target.value.length > 500
                      ? e.target.value.slice(0, 500)
                      : e.target.value,
                }))
              }
            />
            <small
              className={`${
                formInput.content.length >= 500
                  ? "text-red-500"
                  : "dark:text-white text-gray-400"
              }`}
            >
              {`${formInput.content.length}/500`}
            </small>
            {errors?.content && (
              <small className="text-red-500">{errors?.content[0]}</small>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleUpdatePost}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 w-full"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
