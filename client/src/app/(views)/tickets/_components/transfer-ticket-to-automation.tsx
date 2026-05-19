import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useFetch from "@/hooks/use-fetch";
import { api } from "@/lib/api";
import { AlertCircle, Loader2, Save } from "lucide-react";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

type DialogProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: {
    ticket_code: string | number;
    assigned_person: {
      login_id: string | number;
    };
  };
  fetchData: () => Promise<void>;
};

export function TransferTicketToAutomation({
  open,
  setOpen,
  data,
  fetchData,
}: DialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<any>(null);
  const [automation, setAutomation] = useState<string>("");
  const { data: automations, isLoading: automationsLoading } = useFetch({
    url: "/all-automations",
  });

  useEffect(() => {
    if (!data) return;

    setAutomation(String(data?.assigned_person?.login_id));
  }, [data]);

  const handleTransfer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.patch(
        `/transfer-ticket/${data.ticket_code}/to-automation`,
        {
          automation,
        },
      );

      if (response.status === 200) {
        setOpen(false);
        setErrors(null);
        setError(null);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        if (response.data.message === "Nothing changed") return;
        fetchData();
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 422) {
        setErrors(error.response.data.errors);
        setError(null);
      } else {
        setError(error.response.data.message);
        setErrors(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleTransfer} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Transfer to automation</DialogTitle>
            <DialogDescription>
              Are you sure you want to transfer this ticket "
              <span className="font-bold">{data.ticket_code}</span>" to
              automation?
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="automation">Select automation</Label>
              {automationsLoading ? (
                <Skeleton className="w-full h-10" />
              ) : (
                <Select
                  value={String(automation)}
                  onValueChange={setAutomation}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a automation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Automations</SelectLabel>
                      {automations.length > 0 ? (
                        automations.map((automation: any, index: number) => (
                          <SelectItem
                            value={String(automation.login_id)}
                            key={index}
                          >
                            {automation.full_name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="No automation found." disabled>
                          No automation found.
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              {errors?.automation && (
                <small className="text-red-500">{errors?.automation[0]}</small>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Saving changes...
                </>
              ) : (
                <>
                  <Save /> Save changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
