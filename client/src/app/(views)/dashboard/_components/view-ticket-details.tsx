import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

export function ViewTicketDetails({ data }: any) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="border-none bg-transparent shadow-none hover:scale-105"
        >
          <Eye className="h-4 w-4 text-green-500 hover:text-green-600" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <span className="text-gray-700 text-sm">
              Viewing <span className="font-bold">{data.ticket_code}</span>{" "}
              ticket from{" "}
              <span className="font-bold">{data.user_login.full_name}</span>...
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">asd</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
