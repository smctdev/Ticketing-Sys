import { ReactNode, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuth } from "@/context/auth-context";
import diffForHumans from "@/utils/diff-for-humans";
import Link from "next/link";
import { MessageCircleMore } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { open } = useSidebar();
  const { user: authUser } = useAuth();
  const { usersOnline, notify, setNotify } = useChat();
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge className="bg-green-600 text-green-100 py-1 font-bold cursor-pointer">
                        Total online: {usersOnline.length}
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="flex flex-col max-h-[300px] overflow-y-auto">
                        {usersOnline?.map((user) => (
                          <Link
                            href={`/chats/${user.id}`}
                            className="font-bold"
                            key={user.id}
                          >
                            <div className="flex justify-between items-center group hover:bg-black/10 rounded-md p-2">
                              <div className="text-xs flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                <span className="font-bold group-hover:hidden">
                                  {authUser.login_id === user.id
                                    ? "You"
                                    : user.full_name}
                                </span>
                                <span className="font-bold group-hover:block hidden gap-1">
                                  <span className="flex gap-1 items-center text-blue-500">
                                    <MessageCircleMore size={15} />{" "}
                                    <span>Chat now!</span>
                                  </span>
                                </span>
                              </div>
                              <div className="text-[10px]">
                                {diffForHumans(user.timestamp)}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
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
      <Dialog
        open={notify.isOpen}
        onOpenChange={(open) =>
          setNotify((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{notify.title}</DialogTitle>
          </DialogHeader>
          <div className="break-word whitespace-break-spaces max-h-96 overflow-y-auto">
            {notify.message}
          </div>
          <DialogFooter className="flex justify-between! items-center">
            <DialogDescription>From: {notify.notifyBy}</DialogDescription>
            <DialogClose asChild>
              <Button type="button" variant={"secondary"}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppLayout;
