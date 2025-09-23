import { ReactNode } from "react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import Notification from "../notification";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { notifications, totalUnreadNotifications } = useAuth();
  const { open } = useSidebar();
  const pathname = usePathname();
  const path: any =
    pathname === "/"
      ? ["Home"]
      : pathname.replace(/-/g, " ").split("/").slice(1);
  return (
    <>
      <AppSidebar />
      <main className="w-full h-screen overflow-hidden">
        <div className="flex flex-col">
          <div className={`${open ? "p-[13px]" : "p-[6px]"} border-b`}>
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <SidebarTrigger />
                {path?.map((p: string, index: number) => (
                  <Breadcrumb key={index}>
                    <BreadcrumbList>
                      <BreadcrumbItem className="text-black capitalize">
                        <span
                          className={`${
                            path?.length - 1 === index
                              ? "font-bold"
                              : "font-semibold"
                          } text-gray-600`}
                        >
                          {p}
                        </span>
                      </BreadcrumbItem>
                      {path?.length - 1 !== index && <BreadcrumbSeparator />}
                    </BreadcrumbList>
                  </Breadcrumb>
                ))}
              </div>
              <Notification
                totalUnreadNotifications={totalUnreadNotifications}
                notifications={notifications}
              />
            </div>
          </div>
          <div className="p-7 h-[calc(100vh-60px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default AppLayout;
