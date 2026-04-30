import { Dispatch, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import ButtonLoader from "@/components/ui/button-loader";
import { Switch } from "@/components/ui/switch";
import { Feedback } from "../page";

type Props = {
  setFeedbacks: Dispatch<React.SetStateAction<Feedback[]>>;
};

const INITIAL_FORM = { comment: "", is_anonymous: false, rating: 0 };

export function AddFeedback({ setFeedbacks }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [hovered, setHovered] = useState(0);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/feedbacks", form);
      if (response.status === 201) {
        setIsOpen(false);
        setForm(INITIAL_FORM);
        setErrors(null);
        setError(null);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setFeedbacks((prev) => [response.data.data, ...prev]);
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
        setError(null);
      } else {
        setError(err.response?.data?.message ?? "Something went wrong.");
        setErrors(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:block">Add Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription>
              Please enter your honest feedback so that we can improve.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1 items-center justify-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1;

                return (
                  <Button
                    variant={"link"}
                    key={i}
                    type="button"
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setForm((f) => ({ ...f, rating: value }))}
                  >
                    <Star
                      className={`size-10 transition-colors ${
                        value <= (hovered || form.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </Button>
                );
              })}
            </div>
            {errors?.rating && (
              <small className="text-red-500">{errors.rating[0]}</small>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="comment">Message</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience..."
              className="resize-none max-h-64 wrap-anywhere"
              rows={4}
              value={form.comment}
              onChange={(e) =>
                setForm((f) => ({ ...f, comment: e.target.value }))
              }
            />
            {errors?.comment && (
              <small className="text-red-500">{errors.comment[0]}</small>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="is_anonymous">Submit as Anonymous</Label>
            <Switch
              onCheckedChange={(checked) =>
                setForm((f) => ({ ...f, is_anonymous: checked }))
              }
            />
            {errors?.is_anonymous && (
              <small className="text-red-500">{errors.is_anonymous[0]}</small>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
            <ButtonLoader
              type="submit"
              isLoading={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit
            </ButtonLoader>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
