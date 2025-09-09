"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoaderCircle, MessageCircleWarning } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { USER_DETAILS } from "@/constants/user-details";
import { UserDetailsType } from "@/types/user-details-type";
import { api } from "@/lib/api";
import useFetch from "@/hooks/use-fetch";
import Swal from "sweetalert2";
import { avoidSpacesOnInput } from "@/utils/avoid-spaces-helper";
import withOutAuthPage from "@/lib/hoc/with-out-auth-page";

const Register = () => {
  const [formInput, setFormInput] = useState<UserDetailsType>(USER_DETAILS);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenSelect, setIsOpenSelect] = useState<boolean>(false);
  const router = useRouter();
  const { isLoading: branchIsLoading, data } = useFetch({
    url: "/branches",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post("/register", formInput);
      if (response.status === 200) {
        setError(null);
        setErrors(null);
        Swal.fire({
          icon: "success",
          title: "Success",
          confirmButtonColor: "#1e88e5",
          confirmButtonText: "Ok",
          html: `Your account has been created successfully.<br>You will be redirected to the Login page.<br>Thank you!`,
        }).then((result) => {
          if (result.isConfirmed) {
            router.push("/login");
          }
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
    }
  }

  const handleChange =
    (title: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setFormInput((formInput) => ({
        ...formInput,
        [title]: value,
      }));
    };

  const handleSelectChange = (e: any) => {
    setFormInput((formInput) => ({
      ...formInput,
      blist_id: e,
    }));
  };

  const dataMemo = useMemo(() => {
    return data?.data?.length > 0 ? (
      data?.data?.map((branch: any, index: number) => (
        <SelectItem value={String(branch.blist_id)} key={index}>
          {branch.b_code.toUpperCase()}
        </SelectItem>
      ))
    ) : (
      <SelectItem disabled value="No branches found">
        No Branches Found
      </SelectItem>
    );
  }, [data]);

  return (
    <div className="grid place-items-center h-screen">
      <div className="w-full max-w-md space-y-3">
        <div>
          {error && (
            <Alert variant="destructive">
              <MessageCircleWarning />
              <AlertTitle>Ops!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <CardHeader className="text-center">
              <CardTitle>Register your account</CardTitle>
              <CardDescription>
                Enter your details below to create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="fname" className="text-gray-600">
                      First name
                    </Label>
                    <Input
                      id="fname"
                      type="text"
                      placeholder="Enter first name"
                      className="h-12"
                      value={formInput.fname}
                      onChange={handleChange("fname")}
                    />
                    {errors?.fname && (
                      <small className="text-red-500">{errors?.fname[0]}</small>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="lname" className="text-gray-600">
                      Last name
                    </Label>
                    <Input
                      id="lname"
                      type="text"
                      placeholder="Enter last name"
                      className="h-12"
                      value={formInput.lname}
                      onChange={handleChange("lname")}
                    />
                    {errors?.lname && (
                      <small className="text-red-500">{errors?.lname[0]}</small>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="user_email" className="text-gray-600">
                      Email
                    </Label>
                  </div>
                  <Input
                    id="user_email"
                    type="text"
                    placeholder="Enter email"
                    className="h-12"
                    value={formInput.user_email}
                    onChange={handleChange("user_email")}
                  />
                  {errors?.user_email && (
                    <small className="text-red-500">
                      {errors?.user_email[0]}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="blist_id" className="text-gray-600">
                      Branch Code
                    </Label>
                  </div>
                  <Select
                    onValueChange={handleSelectChange}
                    value={formInput.blist_id}
                  >
                    <SelectTrigger className="w-full py-[23.5px]">
                      <SelectValue
                        placeholder={
                          branchIsLoading
                            ? "Fetching Branches..."
                            : "Select a Branch Code"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem disabled value="Select a Branch Code">
                          Select a Branch Code
                        </SelectItem>
                        {dataMemo}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors?.blist_id && (
                    <small className="text-red-500">
                      {errors?.blist_id[0]}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="user_contact" className="text-gray-600">
                      Contact number
                    </Label>
                  </div>
                  <Input
                    id="user_contact"
                    type="number"
                    placeholder="Enter contact number"
                    className="h-12"
                    value={formInput.user_contact}
                    onChange={handleChange("user_contact")}
                  />
                  {errors?.user_contact && (
                    <small className="text-red-500">
                      {errors?.user_contact[0]}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="username" className="text-gray-600">
                      Username
                    </Label>
                  </div>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    className="h-12"
                    value={formInput.username}
                    onChange={handleChange("username")}
                  />
                  {errors?.username && (
                    <small className="text-red-500">
                      {errors?.username[0]}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-gray-600">
                      Password
                    </Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    className="h-12"
                    value={formInput.password}
                    onChange={handleChange("password")}
                    onKeyDown={avoidSpacesOnInput}
                  />
                  {errors?.password && (
                    <small className="text-red-500">
                      {errors?.password[0]}
                    </small>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password_confirmation"
                      className="text-gray-600"
                    >
                      Password confirmation
                    </Label>
                  </div>
                  <Input
                    id="password_confirmation"
                    type="password"
                    placeholder="Enter password confirmation"
                    className="h-12"
                    value={formInput.password_confirmation}
                    onChange={handleChange("password_confirmation")}
                    onKeyDown={avoidSpacesOnInput}
                  />
                  {errors?.password_confirmation && (
                    <small className="text-red-500">
                      {errors?.password_confirmation[0]}
                    </small>
                  )}
                </div>
                <div className="flex gap-1 items-center">
                  <p>Already have an account?</p>
                  <Link
                    href="/login"
                    className="mr-auto inline-block underline-offset-4 hover:underline text-blue-500 hover:text-blue-600"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {isLoading ? (
                  <span className="flex gap-1 items-center">
                    <LoaderCircle className="animate-spin" />
                    <span>Registering...</span>
                  </span>
                ) : (
                  "Register"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default withOutAuthPage(Register);
