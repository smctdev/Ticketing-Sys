"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import AppLayout from "./app-layout";
import AuthLayout from "./auth-layout";

export default function BaseLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const isAlreadyAuthenticated = isAuthenticated && user;

  return isAlreadyAuthenticated ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <AuthLayout>{children}</AuthLayout>
  );
}
