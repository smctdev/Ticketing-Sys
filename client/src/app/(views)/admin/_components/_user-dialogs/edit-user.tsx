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
import { Loader2Icon, PenIcon, Save } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
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
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

interface EditUserProps {
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  data: any;
  branchMemo: any;
  userRoleMemo: any;
}

export function EditUser({
  setIsRefresh,
  data,
  branchMemo,
  userRoleMemo,
}: EditUserProps) {
  const [formItems, setFormItems] =
    useState<UserFormItemsTypes>(USER_FORM_ITEMS);
  const [errors, setErrors] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    setFormItems((prev) => ({
      ...prev,
      first_name: data.user_detail.fname,
      last_name: data.user_detail.lname,
      contact_number: data.user_detail.user_contact,
      email: data.user_detail.user_email,
      username: data.username,
      role: data.user_role_id,
      branch_code: data.branches.map((branch: any) => String(branch.blist_id)) ?? "",
    }));
  }, [isOpenDialog]);

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

  const handleSelectValue = (title: string) => (value: string[]) => {
    setFormItems((prev) => ({
      ...prev,
      [title]: value,
    }));
  };

  const formSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRefresh(true);
    try {
      const response = await api.patch(
        `/users/${data.user_details_id}/update`,
        formItems
      );
      if (response.status === 200) {
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
        <button
          type="button"
          className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
        >
          <PenIcon size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form className="space-y-5" onSubmit={formSubmit}>
          <DialogHeader>
            <DialogTitle className="font-bold text-gray-700">
              Edit User
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
                <MultiSelect
                  modal={true}
                  onValuesChange={handleSelectValue("branch_code")}
                  values={formItems?.branch_code ?? ""}
                >
                  <MultiSelectTrigger className="w-full max-w-[350px]">
                    <MultiSelectValue placeholder="Select branch codes..." />
                  </MultiSelectTrigger>
                  <MultiSelectContent>
                    <MultiSelectGroup>
                      {branchMemo === "isLoading" ? (
                        <MultiSelectItem value="Loading..." disabled>
                          Loading...
                        </MultiSelectItem>
                      ) : branchMemo === "isEmpty" ? (
                        <MultiSelectItem value="No branches yet." disabled>
                          No branches yet.
                        </MultiSelectItem>
                      ) : (
                        branchMemo?.map((branch: any, index: number) => (
                          <MultiSelectItem
                            key={index}
                            value={`${branch.blist_id}`}
                          >
                            {branch.b_code}
                          </MultiSelectItem>
                        ))
                      )}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
                {errors?.branch_code && (
                  <small className="text-red-500">{errors?.branch_code}</small>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Role</Label>
              <div>
                <Select
                  onValueChange={handleSelectChange("role")}
                  value={String(formItems?.role)}
                >
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
                  <Loader2Icon className="animate-spin" /> Updating...
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
