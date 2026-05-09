import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Dispatch, SetStateAction, useState } from "react";
import { PostFormInputType } from "../../_types/form-input-type";
import { POST_FORM_ITEMS } from "../../_constants/form-input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function CreatePost({ fetchData }: { fetchData: () => Promise<void> }) {
  const [formInput, setFormInput] =
    useState<PostFormInputType>(POST_FORM_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>(null);
  const [open, setOpen] = useState<boolean>(false);

  const handlePost = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/posts", formInput);

      if (response.status === 201) {
        setFormInput(POST_FORM_ITEMS);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        setOpen(false);
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
      <DialogTrigger asChild>
        <Textarea
          placeholder="What's on your mind?"
          value={formInput.content}
          className="resize-none shadowm max-h-26"
          onChange={(e) =>
            setFormInput((prev) => ({
              ...prev,
              content: e.target.value,
            }))
          }
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Select
              onValueChange={(value) =>
                setFormInput((prev) => ({ ...prev, category: value }))
              }
              value={formInput.category}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="How are you feeling?" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>How are you feeling?</SelectLabel>
                  <SelectItem value="😵 Feeling dizzy">
                    😵 Feeling dizzy
                  </SelectItem>
                  <SelectItem value="😊 Feeling happy">
                    😊 Feeling happy
                  </SelectItem>
                  <SelectItem value="😢 Feeling sad">😢 Feeling sad</SelectItem>
                  <SelectItem value="😠 Feeling angry">
                    😠 Feeling angry
                  </SelectItem>
                  <SelectItem value="😴 Feeling tired">
                    😴 Feeling tired
                  </SelectItem>
                  <SelectItem value="😨 Feeling scared">
                    😨 Feeling scared
                  </SelectItem>
                  <SelectItem value="😤 Feeling frustrated">
                    😤 Feeling frustrated
                  </SelectItem>
                  <SelectItem value="🤒 Feeling sick">
                    🤒 Feeling sick
                  </SelectItem>
                  <SelectItem value="😰 Feeling stressed">
                    😰 Feeling stressed
                  </SelectItem>
                  <SelectItem value="🥰 Feeling loved">
                    🥰 Feeling loved
                  </SelectItem>
                  <SelectItem value="😎 Feeling confident">
                    😎 Feeling confident
                  </SelectItem>
                  <SelectItem value="🤩 Feeling excited">
                    🤩 Feeling excited
                  </SelectItem>
                  <SelectItem value="😔 Feeling lonely">
                    😔 Feeling lonely
                  </SelectItem>
                  <SelectItem value="😇 Feeling grateful">
                    😇 Feeling grateful
                  </SelectItem>
                  <SelectItem value="🤗 Feeling blessed">
                    🤗 Feeling blessed
                  </SelectItem>
                  <SelectItem value="😶 Feeling numb">
                    😶 Feeling numb
                  </SelectItem>
                  <SelectItem value="🥺 Feeling hopeful">
                    🥺 Feeling hopeful
                  </SelectItem>
                  <SelectItem value="😏 Feeling playful">
                    😏 Feeling playful
                  </SelectItem>
                  <SelectItem value="🤔 Feeling confused">
                    🤔 Feeling confused
                  </SelectItem>
                  <SelectItem value="😌 Feeling relaxed">
                    😌 Feeling relaxed
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
            onClick={handlePost}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 w-full"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
