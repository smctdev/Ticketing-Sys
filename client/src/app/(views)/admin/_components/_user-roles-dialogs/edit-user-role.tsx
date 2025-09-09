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
import { Loader2Icon, Pen } from "lucide-react";
import { useEffect, useState } from "react";
import { USER_ROLES_DATA } from "../../_constants/form-data-inputs";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  EditUserRoleProps,
  UserRoleFormDataType,
} from "../../_types/user-roles-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function EditUserRole({ data, setIsRefresh }: EditUserRoleProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formInput, setFormInput] =
    useState<UserRoleFormDataType>(USER_ROLES_DATA);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormInput({
      role_name: data.role_name,
    });
  }, [data]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.patch(
        `/admin/user-roles/${data.user_role_id}/update`,
        formInput
      );
      if (response.status === 200) {
        setIsOpen(false);
        setFormInput(USER_ROLES_DATA);
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
            <DialogTitle>Updating {data.role_name}...</DialogTitle>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2 flex-col">
            <Label htmlFor="role_name">Role name</Label>
            <Input
              type="text"
              placeholder="Enter role name"
              value={formInput.role_name}
              onChange={(e) => setFormInput({ role_name: e.target.value })}
            />
            {errors?.role_name && (
              <small className="text-red-500">{errors?.role_name[0]}</small>
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
                <>Update</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
