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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/context/chat-context";
import { Bell } from "lucide-react";

export default function NotifyAllUser() {
  const { handleSendNotify, setNotify, notify } = useChat();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Bell /> Notify All User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notify All User</DialogTitle>
          <DialogDescription>
            Are you sure you want to notify all user?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex flex-col gap-1">
            <Label htmlFor="title">Title</Label>
            <Input
              value={notify.title}
              onChange={(e) =>
                setNotify((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter a title"
            />
            {notify.errors.title && (
              <small className="text-red-500">{notify.errors.title}</small>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="message">Message</Label>
            <Textarea
              value={notify.message}
              onChange={(e) =>
                setNotify((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Enter a message"
              className="resize-none max-h-50"
            />
            {notify.errors.message && (
              <small className="text-red-500">{notify.errors.message}</small>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant={"secondary"}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSendNotify}
            disabled={!notify.title || !notify.message}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
