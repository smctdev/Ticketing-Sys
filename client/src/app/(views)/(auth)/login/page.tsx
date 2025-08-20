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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CREDENTIALS } from "@/constants/credentials";
import { useAuth } from "@/context/auth-context";
import { CredentialType } from "@/types/auth-context-type";
import { LoaderCircle, MessageCircleWarning } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoginAsCode from "../_components/login-as-code";
import { avoidSpacesOnInput } from "@/utils/avoid-spaces-helper";
import { Checkbox } from "@/components/ui/checkbox";
import withOutAuthPage from "@/lib/hoc/with-out-auth-page";

const Login = () => {
  const [credentials, setCredentials] = useState<CredentialType>(CREDENTIALS);
  const [errors, setErrors] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login(credentials);
      if (response.status === 204) {
        setError(null);
        setErrors(null);
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
    (title: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCredentials((credentials) => ({
        ...credentials,
        [title]: value,
      }));
    };

  const handleShowPassword = (e: any) => {
    setIsShowPassword(e);
  };

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
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your username or email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="usernameOrEmail" className="text-gray-600">
                    Username/Email
                  </Label>
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    placeholder="Enter username or email"
                    className="h-12"
                    value={credentials.usernameOrEmail}
                    onChange={handleChange("usernameOrEmail")}
                  />
                  {errors?.usernameOrEmail && (
                    <small className="text-red-500">
                      {errors?.usernameOrEmail[0]}
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
                    type={isShowPassword ? "text" : "password"}
                    placeholder="Enter password"
                    className="h-12"
                    value={credentials.password}
                    onChange={handleChange("password")}
                    onKeyDown={avoidSpacesOnInput}
                  />
                  {errors?.password && (
                    <small className="text-red-500">
                      {errors?.password[0]}
                    </small>
                  )}
                  <div className="flex gap-1 items-center">
                    <Checkbox onCheckedChange={handleShowPassword} />
                    <span className="text-sm text-gray-600">
                      {isShowPassword ? "Hide" : "Show"} password
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm">
                    <span className="mr-1">Doesn&apos;t have an account?</span>
                    <Link
                      href="/register"
                      className="text-blue-500 hover:text-blue-600 underline-offset-4 hover:underline"
                    >
                      Register
                    </Link>
                  </p>
                  <Link
                    href="/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 font-bold"
              >
                {isLoading ? (
                  <span className="flex gap-1 items-center">
                    <LoaderCircle className="animate-spin" />
                    <span>Logging in...</span>
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="flex items-center gap-4 w-full">
                <hr className="w-full" />
                <span className="text-gray-700 font-thin">or</span>
                <hr className="w-full" />
              </div>
              <LoginAsCode />
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default withOutAuthPage(Login);
