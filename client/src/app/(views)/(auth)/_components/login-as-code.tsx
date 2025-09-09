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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { Loader2Icon, MessageCircleWarning } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export default function LoginAsCode() {
  const [email, setEmail] = useState<string>("");
  const [errors, setErrors] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnterCode, setIsEnterCode] = useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const { loginAsOtp } = useAuth();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleChangeEventOtp = (value: string) => {
    setCode(value);
  };

  const handleSendLoginCode = async () => {
    setIsLoading(true);
    try {
      const response = await api.post("/send-login-code", { email });
      if (response.status === 200) {
        setIsEnterCode(true);
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
    }
  };

  const handleSubmitOtp = async () => {
    setIsLoading(true);
    try {
      const response = await loginAsOtp(code, email);
      if (response.status === 200) {
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
  };

  const handleClose = () => {
    setIsEnterCode(false);
    setError(null);
    setErrors(null);
    setEmail("");
    setCode("");
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full" asChild>
        <Button
          type="button"
          variant="ghost"
          className="bg-yellow-500 w-full hover:bg-yellow-600 text-white hover:text-white font-bold"
        >
          Login with OTP
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEnterCode ? "Enter 6 digits code" : "Login with OTP"}
          </DialogTitle>
          <DialogDescription>
            {isEnterCode
              ? "Please enter the 6 digits code sent to your email."
              : "Enter your email address below to get a login code."}
          </DialogDescription>
          <DialogDescription className="flex flex-col gap-1" asChild>
            <div>
              {isEnterCode && (
                <Alert variant="default" className="text-green-500">
                  <MessageCircleWarning />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription className="text-green-500">
                    Login code sent to your email {email}
                  </AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <MessageCircleWarning />
                  <AlertTitle>Ops!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          {isEnterCode ? (
            <div className="grid flex-1 gap-2">
              <Label className="text-sm">Enter 6 digits code</Label>
              <InputOTP
                maxLength={[0, 1, 2, 3, 4, 5].length}
                onChange={handleChangeEventOtp}
              >
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot
                      index={index}
                      className="w-[67px] h-16"
                      key={index}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {errors?.otp && (
                <small className="text-red-500">{errors?.otp[0]}</small>
              )}
            </div>
          ) : (
            <div className="grid flex-1 gap-2">
              <Input
                value={email}
                onChange={handleChange}
                placeholder="Enter your email address"
                type="email"
                className="h-12"
              />
              {errors?.email && (
                <small className="text-red-500">{errors?.email[0]}</small>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="flex justify-end-safe w-full">
            <div className="flex gap-1">
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={isEnterCode ? handleSubmitOtp : handleSendLoginCode}
                type="button"
                disabled={isLoading}
                variant="ghost"
                className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white font-bold"
              >
                {isLoading ? (
                  <span className="flex gap-1 items-center">
                    <Loader2Icon className="animate-spin" />{" "}
                    <span>{isEnterCode ? "Submit" : "Sending..."}</span>
                  </span>
                ) : (
                  <>{isEnterCode ? "Submit" : "Send"}</>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
