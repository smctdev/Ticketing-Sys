import { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { RefreshCcw } from "lucide-react";

interface ButtonLoaderProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
  variant?:
    | "default"
    | "ghost"
    | "outline"
    | "secondary"
    | "link"
    | "destructive"
    | null
    | undefined;
  size?: "default" | "sm" | "lg" | "xs" | "icon" | null | undefined;
}

export default function ButtonLoader({
  isLoading = false,
  children,
  variant = "default",
  size = "default",
  ...props
}: ButtonLoaderProps) {
  return (
    <Button disabled={isLoading} variant={variant} size={size} {...props}>
      {isLoading ? <Spinner /> : <RefreshCcw />}
      <span>{children}</span>
    </Button>
  );
}
