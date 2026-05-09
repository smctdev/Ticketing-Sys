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
import { SUB_CATEGORY_DATA } from "../../_constants/form-data-inputs";
import {
  AddSubCategoryProps,
  SubCategoryFormDataType,
} from "../../_types/sub-category-types";

export function AddSubCategory({
  fetchData,
  ticketCategoryId,
}: AddSubCategoryProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formInput, setFormInput] =
    useState<SubCategoryFormDataType>(SUB_CATEGORY_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/admin/sub-categories", {
        ticket_category_id: ticketCategoryId,
        ...formInput,
      });
      if (response.status === 201) {
        setIsOpen(false);
        setFormInput(SUB_CATEGORY_DATA);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setErrors(null);
        setError(null);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:block">Add Sub Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-7">
          <DialogHeader>
            <DialogTitle>Add Sub Category</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-col">
            <Label htmlFor="sub_category_name">Sub category name</Label>
            <Input
              type="text"
              placeholder="Enter sub category name"
              value={formInput.sub_category_name}
              onChange={(e) =>
                setFormInput((prev) => ({
                  ...prev,
                  sub_category_name: e.target.value,
                }))
              }
            />
            {errors?.sub_category_name && (
              <small className="text-red-500">
                {errors?.sub_category_name[0]}
              </small>
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
