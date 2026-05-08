import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function IsForCounted({
  ticketCode,
  open,
  setOpen,
  setIsOpen,
  type,
  fetchData,
}: any) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleIsForCounted = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.patch(
        `/counted-or-not-counted/${ticketCode}/counted-or-not-counted`,
      );
      if (response.status === 200) {
        setError(null);
        setOpen(false);
        setIsOpen(false);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        fetchData();
      }
    } catch (error: any) {
      console.error(error);
      setError(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {error && (
            <Alert variant={"destructive"}>
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogDescription>
            Are you sure you want to {type} this ticket code "
            <span className="font-bold">{ticketCode}</span>"? This action cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleIsForCounted}>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant={"outline"}
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                </>
              ) : (
                `Yes, ${type} it`
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
