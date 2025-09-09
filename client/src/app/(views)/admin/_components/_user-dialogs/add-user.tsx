import FormInputGroup from "@/components/form-input-group";
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
import { Label } from "@/components/ui/label";
import { Loader2Icon, Plus } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
} from "react";
import { USER_FORM_ITEMS } from "../../_constants/form-items";
import { UserFormItemsTypes } from "@/types/form-group";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AddUserProps {
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  userRoleMemo: any;
  branchMemo: any;
}

export function AddUser({
  setIsRefresh,
  userRoleMemo,
  branchMemo,
}: AddUserProps) {
  const [formItems, setFormItems] =
    useState<UserFormItemsTypes>(USER_FORM_ITEMS);
  const [errors, setErrors] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  const handleInputChange =
    (title: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFormItems((formItems) => ({
        ...formItems,
        [title]: value,
      }));
    };

  const handleSelectChange = (title: string) => (value: string) => {
    setFormItems((formItems) => ({
      ...formItems,
      [title]: value,
    }));
  };

  const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.post("/users", formItems);
      if (response.status === 201) {
        setErrors(null);
        setFormItems(USER_FORM_ITEMS);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        setIsOpenDialog(false);
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status == 422) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  return (
    <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white"
        >
          <Plus className="h-4 w-4" />{" "}
          <span className="hidden md:block">Add User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-5" onSubmit={formSubmit}>
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-700">
              Add User
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 max-h-80 overflow-y-auto p-3">
            <FormInputGroup
              title={"First name"}
              type={"text"}
              error={errors?.first_name}
              value={formItems?.first_name}
              placeholder={"Enter first name"}
              onChange={handleInputChange("first_name")}
            />
            <FormInputGroup
              title={"Last name"}
              type={"text"}
              error={errors?.last_name}
              value={formItems?.last_name}
              placeholder={"Enter last name"}
              onChange={handleInputChange("last_name")}
            />
            <FormInputGroup
              title={`Contact number`}
              isOptional={true}
              type={"number"}
              error={errors?.contact_number}
              value={formItems?.contact_number}
              placeholder={"Enter contact number"}
              onChange={handleInputChange("contact_number")}
            />
            <FormInputGroup
              title={"Email"}
              type={"email"}
              error={errors?.email}
              value={formItems?.email}
              placeholder={"Enter email"}
              onChange={handleInputChange("email")}
            />
            <FormInputGroup
              title={"Username"}
              type={"text"}
              error={errors?.username}
              value={formItems?.username}
              placeholder={"Enter username"}
              onChange={handleInputChange("username")}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="branch_code">Branch code</Label>
              <div>
                <Select onValueChange={handleSelectChange("branch_code")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a branch code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a branch code</SelectLabel>
                      {branchMemo}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors?.branch_code && (
                  <small className="text-red-500">{errors?.branch_code}</small>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <div>
                <Select onValueChange={handleSelectChange("role")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Select a role</SelectLabel>
                      {userRoleMemo}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors?.role && (
                  <small className="text-red-500">{errors?.role}</small>
                )}
              </div>
            </div>

            <FormInputGroup
              title={"Password"}
              type={"password"}
              error={errors?.password}
              value={formItems?.password}
              placeholder={"Enter password"}
              onChange={handleInputChange("password")}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="animate-spin" /> Adding...
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
