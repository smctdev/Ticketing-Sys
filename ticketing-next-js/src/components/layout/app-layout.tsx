import { ReactNode } from "react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { open } = useSidebar();
  const pathname = usePathname();
  const path = pathname === "/" ? "Home" : pathname.split("/");
  return (
    <>
      <AppSidebar />
      <main className="w-full h-screen overflow-hidden">
        <div className="flex flex-col">
          <div className={`${open ? "p-[13.5px]" : "p-[6.5px]"} border-b`}>
            <div className="flex gap-3 items-center">
              <SidebarTrigger />
              <Breadcrumb>
                <BreadcrumbItem className="text-black capitalize">
                  {path}
                </BreadcrumbItem>
              </Breadcrumb>
            </div>
          </div>
          <div className="p-2 h-[calc(100vh-55px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
    </>
  );
};

export default AppLayout;
