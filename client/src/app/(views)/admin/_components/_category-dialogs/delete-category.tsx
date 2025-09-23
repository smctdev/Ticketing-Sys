import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { DeleteCategoryProps } from "../../_types/category-types";

export function DeleteCategory({ data, setIsRefresh }: DeleteCategoryProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleDeleteCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.delete(
        `/admin/categories/${data.ticket_category_id}/delete`
      );
      if (response.status === 200) {
        setError(null);
        setIsOpen(false);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
      }
    } catch (error: any) {
      console.error(error);
      setError(error.response.data.message);
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="text-red-500 hover:text-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
        >
          <Trash size={18} />
        </button>
      </AlertDialogTrigger>
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
            Are you sure you want to delete this ticket category "
            <span className="font-bold">{data?.category_name}</span>"? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleDeleteCategory}>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant={"destructive"} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash /> Yes, Delete
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
