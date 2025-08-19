import { ReactNode } from "react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { AppSidebar } from "../ui/app-sidebar";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { BellDotIcon, BellOffIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { open } = useSidebar();
  const pathname = usePathname();
  const path = pathname === "/" ? "Home" : pathname.split("/");
  return (
    <>
      <AppSidebar />
      <main className="w-full h-screen overflow-hidden">
        <div className="flex flex-col">
          <div className={`${open ? "p-[13px]" : "p-[6px]"} border-b`}>
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <SidebarTrigger />
                <Breadcrumb>
                  <BreadcrumbItem className="text-black capitalize">
                    {path}
                  </BreadcrumbItem>
                </Breadcrumb>
              </div>
              <div className="mr-3">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <BellDotIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-[300px]">
                    <DropdownMenuLabel className="text-gray-600 font-bold text-md">
                      Notifications
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="text-center p-10 space-y-3">
                      <BellOffIcon className="mx-auto size-10 text-gray-500" />
                      <h3 className="text-lg font-bold text-gray-500">
                        No new notifications
                      </h3>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
