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
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BRANCH_DATA } from "../../_constants/form-data-inputs";
import { AddBranchProps, BranchFormDataType } from "../../_types/branch-types";

export function AddBranch({ setIsRefresh }: AddBranchProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formInput, setFormInput] = useState<BranchFormDataType>(BRANCH_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.post("/branches", formInput);
      if (response.status === 201) {
        setIsOpen(false);
        setFormInput(BRANCH_DATA);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:block">Add Branch</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="max-h-[400px] overflow-y-auto space-y-2">
            <div className="flex gap-2 flex-col">
              <Label htmlFor="branch_name">Branch name</Label>
              <Input
                type="text"
                placeholder="Enter branch name"
                value={formInput.branch_name}
                onChange={handleChange("branch_name")}
              />
              {errors?.branch_name && (
                <small className="text-red-500">{errors?.branch_name[0]}</small>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <Label htmlFor="branch_code">Branch code</Label>
              <Input
                type="text"
                placeholder="Enter branch code"
                value={formInput.branch_code}
                onChange={handleChange("branch_code")}
              />
              {errors?.branch_code && (
                <small className="text-red-500">{errors?.branch_code[0]}</small>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <Label htmlFor="category">Branch category</Label>
              <Input
                type="text"
                placeholder="Enter branch category"
                value={formInput.category}
                onChange={handleChange("category")}
              />
              {errors?.category && (
                <small className="text-red-500">{errors?.category[0]}</small>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <Label htmlFor="branch_address">Branch address</Label>
              <Input
                type="text"
                placeholder="Enter branch address"
                value={formInput.branch_address}
                onChange={handleChange("branch_address")}
              />
              {errors?.branch_address && (
                <small className="text-red-500">
                  {errors?.branch_address[0]}
                </small>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <Label htmlFor="branch_contact_number">
                Branch contact number
              </Label>
              <Input
                type="number"
                placeholder="Enter branch contact number"
                value={formInput.branch_contact_number}
                onChange={handleChange("branch_contact_number")}
              />
              {errors?.branch_contact_number && (
                <small className="text-red-500">
                  {errors?.branch_contact_number[0]}
                </small>
              )}
            </div>
            <div className="flex gap-2 flex-col">
              <Label htmlFor="branch_email">Branch email</Label>
              <Input
                type="email"
                placeholder="Enter branch email"
                value={formInput.branch_email}
                onChange={handleChange("branch_email")}
              />
              {errors?.branch_email && (
                <small className="text-red-500">
                  {errors?.branch_email[0]}
                </small>
              )}
            </div>
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
