"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import AppLayout from "./app-layout";
import AuthLayout from "./auth-layout";
import { SidebarProvider } from "../ui/sidebar";

export default function BaseLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const isAlreadyAuthenticated = isAuthenticated && user;

  return isAlreadyAuthenticated ? (
    <SidebarProvider>
      <AppLayout>{children}</AppLayout>
    </SidebarProvider>
  ) : (
    <AuthLayout>{children}</AuthLayout>
  );
}
