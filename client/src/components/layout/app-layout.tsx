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
import Notification from "../notification";
import ProfileDropdown from "../profile-dropdown";
import SettingsSheet from "../settings-sheet";
import { Badge } from "../ui/badge";
import { useChat } from "@/context/chat-context";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { HoverCardArrow } from "@radix-ui/react-hover-card";
import { differenceInSeconds, formatDistanceToNowStrict } from "date-fns";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { open } = useSidebar();
  const { usersOnline } = useChat();
  const pathname = usePathname();
  const path: any =
    pathname === "/"
      ? ["Home"]
      : pathname.replace(/-/g, " ").split("/").slice(1);

  return (
    <>
      <AppSidebar />
      <main className={`w-full h-screen overflow-hidden`}>
        <div className="flex flex-col">
          <div className={`${open ? "p-[13px]" : "p-1.5"} border-b`}>
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
                          } dark:text-white text-gray-600`}
                        >
                          {p}
                        </span>
                      </BreadcrumbItem>
                      {path?.length - 1 !== index && <BreadcrumbSeparator />}
                    </BreadcrumbList>
                  </Breadcrumb>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {usersOnline.length > 0 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge
                        variant={"outline"}
                        className="bg-green-600 text-green-100 py-1 font-bold"
                      >
                        Total online: {usersOnline.length}
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <HoverCardArrow />
                      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                        {usersOnline?.map((user) => (
                          <div
                            className="flex justify-between items-center"
                            key={user.id}
                          >
                            <div className="text-[10px] flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                              <span className="font-bold">
                                {user.full_name}
                              </span>
                            </div>
                            <div className="text-[10px]">
                              {differenceInSeconds(
                                new Date(),
                                new Date(user.timestamp),
                              ) < 1
                                ? "Just now"
                                : formatDistanceToNowStrict(
                                    new Date(user.timestamp),
                                    {
                                      addSuffix: true,
                                    },
                                  )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
                <Notification />
                <ProfileDropdown />
              </div>
            </div>
          </div>
          <div
            className={`${!pathname.startsWith("/chats") && "p-7"} h-[calc(100vh-60px)] overflow-y-auto`}
          >
            {children}
          </div>
        </div>
      </main>
      <SettingsSheet />
    </>
  );
};

export default AppLayout;
