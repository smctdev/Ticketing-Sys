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
import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useIsRefresh } from "@/context/is-refresh-context";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";

export function EditNote({
  ticketCode,
  open,
  setOpen,
  setIsOpen,
  noteValue,
  setNoteValue,
}: any) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [note, setNote] = useState<string>("");
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { setIsRefresh } = useIsRefresh();

  useEffect(() => {
    setNote(noteValue);
  }, [noteValue]);

  const handleEditNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.patch(`/edit-note/${ticketCode}/update`, {
        note,
      });
      if (response.status === 200) {
        setError(null);
        setOpen(false);
        setIsOpen(false);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setNote("");
        setNoteValue("");
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 422) {
        setErrors(error.response.data.errors);
        setError("");
      }
      {
        setErrors(null);
        setError(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <form onSubmit={handleEditNote} className="space-y-3">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            {error && (
              <Alert variant={"destructive"}>
                <AlertTitle>Ops!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <AlertDialogDescription>
              Are you sure you want to edit this ticket code "
              <span className="font-bold">{ticketCode}</span>" note? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Label className="text-sm font-medium text-gray-600  leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2">
              Enter note
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note"
            />
            {errors?.note && (
              <small className="text-red-500">{errors?.note[0]}</small>
            )}
          </div>
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
                  <Loader2 className="animate-spin" /> Updating...
                </>
              ) : (
                "Yes, Update"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
