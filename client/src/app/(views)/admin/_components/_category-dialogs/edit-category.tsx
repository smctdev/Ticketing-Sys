import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2Icon, Save } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { CATEGORY_DATA } from "../../_constants/form-data-inputs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  EditCategoryProps,
  CategoryFormDataType,
  GroupCategoryDataType,
} from "../../_types/category-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EditCategory({
  data,
  setIsRefresh,
  groupCategories,
  isLoadingGroupCategories,
  open,
  setOpen,
}: EditCategoryProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formInput, setFormInput] =
    useState<CategoryFormDataType>(CATEGORY_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormInput({
      category_shortcut: data?.category_shortcut,
      category_name: data?.category_name,
      group_code: data?.group_code,
      show_hide: data?.show_hide,
    });
  }, [data]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.patch(
        `/admin/categories/${data.ticket_category_id}/update`,
        formInput
      );
      if (response.status === 200) {
        setOpen(false);
        setFormInput(CATEGORY_DATA);
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

  const handleChange =
    (title: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormInput((formInput) => ({
        ...formInput,
        [title]: value,
      }));
    };

  const handleSelectChange = (title: string) => (value: string) => {
    setFormInput((formInput) => ({
      ...formInput,
      [title]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-7">
          <DialogHeader>
            <DialogTitle>Updating {data?.category_name}...</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-col">
            <Label htmlFor="category_shortcut">Category shortcut</Label>
            <Input
              type="text"
              placeholder="Enter category shortcut"
              value={formInput.category_shortcut}
              onChange={handleChange("category_shortcut")}
            />
            {errors?.category_shortcut && (
              <small className="text-red-500">
                {errors?.category_shortcut[0]}
              </small>
            )}
          </div>
          <div className="flex gap-2 flex-col">
            <Label htmlFor="category_name">Category name</Label>
            <Input
              type="text"
              placeholder="Enter category name"
              value={formInput.category_name}
              onChange={handleChange("category_name")}
            />
            {errors?.category_name && (
              <small className="text-red-500">{errors?.category_name[0]}</small>
            )}
          </div>
          <div className="flex gap-2 flex-col">
            <Label htmlFor="show_hide">Show or hide</Label>
            <Select
              value={String(formInput.show_hide)}
              onValueChange={handleSelectChange("show_hide")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select show or hide" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Show or hide</SelectLabel>
                  <SelectItem value="show">Show</SelectItem>
                  <SelectItem value="hide">Hide</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors?.show_hide && (
              <small className="text-red-500">{errors?.show_hide[0]}</small>
            )}
          </div>
          <div className="flex gap-2 flex-col">
            <Label htmlFor="group_code">Group code</Label>
            <Select
              value={String(formInput.group_code)}
              onValueChange={handleSelectChange("group_code")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select group code" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Group code</SelectLabel>
                  {isLoadingGroupCategories ? (
                    <SelectItem value="Loading..." disabled>
                      Loading...
                    </SelectItem>
                  ) : groupCategories?.length > 0 ? (
                    groupCategories?.map(
                      (groupCategory: GroupCategoryDataType, index: number) => (
                        <SelectItem
                          key={index}
                          value={String(groupCategory?.id)}
                        >
                          {groupCategory?.group_code}
                        </SelectItem>
                      )
                    )
                  ) : (
                    <SelectItem value="No group categories found" disabled>
                      No group categories found
                    </SelectItem>
                  )}
                  <SelectItem value="others">Others</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors?.group_code && (
              <small className="text-red-500">{errors?.group_code[0]}</small>
            )}
          </div>
          {formInput.group_code === "others" && (
            <div className="flex gap-2 flex-col">
              <Label htmlFor="others">Other group code</Label>
              <Input
                type="text"
                placeholder="Enter other group code"
                value={formInput.other_category}
                onChange={handleChange("other_category")}
              />
              {errors?.other_category && (
                <small className="text-red-500">
                  {errors?.other_category[0]}
                </small>
              )}
            </div>
          )}
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
