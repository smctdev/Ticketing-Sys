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
import { api } from "@/lib/api";
import { Loader2Icon, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AddSupplierProps,
  SupplierFormDataType,
} from "../../_types/supplier-types";
import { SUPPLIER_DATA } from "../../_constants/form-data-inputs";

export function AddSupplier({ setIsRefresh }: AddSupplierProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formInput, setFormInput] =
    useState<SupplierFormDataType>(SUPPLIER_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.post("/admin/suppliers", formInput);
      if (response.status === 201) {
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
        <Button
          type="button"
          variant="outline"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:block">Add Supplier</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-7">
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-col">
            <Label htmlFor="suppliers">Supplier name</Label>
            <Input
              type="text"
              placeholder="Enter supplier name"
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
                  <Loader2Icon className="h-4 w-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus /> Add
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
