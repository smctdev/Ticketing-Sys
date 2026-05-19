"use client";

import { ReactNode, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import AppLayout from "./app-layout";
import AuthLayout from "./auth-layout";
import { SidebarProvider } from "../ui/sidebar";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

export default function BaseLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const isAlreadyAuthenticated = isAuthenticated && user;
  const pathname = usePathname();
  const isNotHome = pathname !== "/";
  const [isNoInternetConnection, setIsNoInternetConnection] =
    useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    window.addEventListener("offline", () => {
      setIsNoInternetConnection(true);
    });

    window.addEventListener("online", () => {
      setIsConnecting(true);
      setIsNoInternetConnection(false);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setTimeout(() => {
          setIsConnected(false);
        }, 2000);
      }, 2000);
    });

    return () => {
      window.removeEventListener("offline", () => {});
      window.removeEventListener("online", () => {});
    };
  }, []);

  return (
    <>
      {(isNoInternetConnection || isConnecting || isConnected) && (
        <div className="fixed top-0 w-full z-50">
          <div
            className={`p-5 w-full ${isNoInternetConnection ? "bg-red-500" : isConnecting ? "bg-blue-500" : "bg-green-500"}`}
          >
            <p className="text-center text-white">
              {isNoInternetConnection
                ? "No internet connection. Please realod the page."
                : isConnecting
                  ? "Connecting..."
                  : "Back online."}
            </p>
          </div>
        </div>
      )}
      <Suspense fallback={"Loading..."}>
        {isAlreadyAuthenticated && isNotHome ? (
          <SidebarProvider>
            <AppLayout>{children}</AppLayout>
          </SidebarProvider>
        ) : (
          <AuthLayout>{children}</AuthLayout>
        )}
      </Suspense>
      <Toaster />
    </>
  );
}
