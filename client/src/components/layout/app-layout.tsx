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
