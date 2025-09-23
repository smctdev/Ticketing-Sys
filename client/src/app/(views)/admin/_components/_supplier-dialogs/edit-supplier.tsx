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
import { Loader2Icon, Pen, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { SUPPLIER_DATA } from "../../_constants/form-data-inputs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  EditSupplierProps,
  SupplierFormDataType,
} from "../../_types/supplier-types";

export function EditSupplier({ data, setIsRefresh }: EditSupplierProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formInput, setFormInput] =
    useState<SupplierFormDataType>(SUPPLIER_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormInput({
      suppliers: data.suppliers,
    });
  }, [data]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.patch(
        `/admin/suppliers/${data.id}/update`,
        formInput
      );
      if (response.status === 200) {
        setIsOpen(false);
        setFormInput(SUPPLIER_DATA);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        setError(null);
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
      setIsRefresh(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
        >
          <Pen size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-7">
          <DialogHeader>
            <DialogTitle>Updating {data.suppliers}...</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-col">
            <Label htmlFor="suppliers">Supplier</Label>
            <Input
              type="text"
              placeholder="Enter supplier"
              value={formInput.suppliers}
              onChange={(e) => setFormInput({ suppliers: e.target.value })}
            />
            {errors?.suppliers && (
              <small className="text-red-500">{errors?.suppliers[0]}</small>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save /> Update
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
