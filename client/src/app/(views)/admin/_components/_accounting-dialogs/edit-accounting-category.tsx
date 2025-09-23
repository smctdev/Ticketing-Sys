import InputLoader from "@/components/loaders/input-loader";
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
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import useFetch from "@/hooks/use-fetch";
import { api } from "@/lib/api";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EditAccountingCategoryDialog({
  user,
  open,
  setOpen,
  setIsRefresh,
}: any) {
  const [formInputs, setFormInputs] = useState<string[]>([]);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data, isLoading: categoriesIsLoading } = useFetch({
    url: `/accounting-categories`,
  });

  useEffect(() => {
    setFormInputs(
      user?.assigned_categories?.map((item: any) => String(item.group_code))
    );
  }, [user?.assigned_categories]);

  const handleSelectValue = (e: string[]) => {
    console.log(e);
    setFormInputs(e);
  };

  const handleSaveChanges = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.patch(
        `/accounting-category/${user?.login_id}/update`,
        {
          category_ids: formInputs,
        }
      );

      if (response.status === 200) {
        setOpen(false);
        setErrors(null);
        setFormInputs([]);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
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

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSaveChanges} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Edit accounting category</DialogTitle>
            <DialogDescription>
              Editing a category to an accounting. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            {categoriesIsLoading ? (
              <InputLoader />
            ) : (
              <MultiSelect
                modal={true}
                onValuesChange={handleSelectValue}
                values={formInputs}
              >
                <MultiSelectTrigger className="w-full max-w-[385px] max-h-[200px] overflow-y-auto">
                  <MultiSelectValue placeholder="Select category..." />
                </MultiSelectTrigger>
                <MultiSelectContent>
                  <MultiSelectGroup>
                    {data?.data?.length === 0 ? (
                      <MultiSelectItem value="No categories yet." disabled>
                        No categories yet.
                      </MultiSelectItem>
                    ) : (
                      data?.data?.map((category: any, index: number) => (
                        <MultiSelectItem key={index} value={`${category.id}`}>
                          {category.group_code}
                        </MultiSelectItem>
                      ))
                    )}
                  </MultiSelectGroup>
                </MultiSelectContent>
              </MultiSelect>
            )}
            {errors?.category && (
              <small className="text-red-500">{errors?.category}</small>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              variant={"default"}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Saving...
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
