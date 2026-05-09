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
import { SUB_CATEGORY_DATA } from "../../_constants/form-data-inputs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  EditSubCategoryProps,
  SubCategoryFormDataType,
} from "../../_types/sub-category-types";

export function EditSubCategory({ data, fetchData }: EditSubCategoryProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formInput, setFormInput] =
    useState<SubCategoryFormDataType>(SUB_CATEGORY_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormInput({
      sub_category_name: data.sub_category_name,
    });
  }, [data]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.patch(
        `/admin/sub-categories/${data.id}/update`,
        {
          ticket_category_id: data.ticket_category_id,
          ...formInput,
        },
      );
      if (response.status === 200) {
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
            <DialogTitle>Updating {data.sub_category_name}...</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-col">
            <Label htmlFor="subCategorys">SubCategory</Label>
            <Input
              type="text"
              placeholder="Enter subCategory"
              value={formInput.sub_category_name}
              onChange={(e) =>
                setFormInput({ sub_category_name: e.target.value })
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
