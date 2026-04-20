import Logo from "@/assets/logo.png";
import { ChevronRight, LogOut, MenuIcon, Settings, User } from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import nameShortHand from "@/utils/name-short-hand";
import Swal from "sweetalert2";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { Button } from "./button";
import Link from "next/link";
import { useState } from "react";
import {
  SIDEBAR_ITEMS,
  COLLAPSABLE_SIDEBAR_ITEMS,
} from "@/constants/sidebar-items";
import { usePathname } from "next/navigation";
import Storage from "@/utils/storage";
import { useSettings } from "@/context/settings-context";
import { ROLE } from "@/constants/roles";
import { useChat } from "@/context/chat-context";
import { Badge } from "./badge";

export function AppSidebar() {
  const { open } = useSidebar();
  const { logout, user, isAdmin } = useAuth();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState<boolean>(true);
  const { messageReceivedCount } = useChat();
  const pathname = usePathname();
  const { setIsOpen } = useSettings();
  const isAudit = user?.user_role?.role_name === ROLE.AUDIT;
  const isSuperAdmin = user?.user_role?.role_name === ROLE.SUPER_ADMIN;

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure you want to Logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logged me out!",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  function handleCollapsibleOpen(e: any) {
    setIsCollapsibleOpen(e);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center gap-2 p-3">
        <div className="flex gap-2 items-center">
          <div>
            <Image
              src={Logo}
              alt="Logo"
              width={70}
              height={70}
              className="rounded"
            />
          </div>
          {open && (
            <span className="font-semibold text-lg tracking-tight">
              Ticketing System
            </span>
          )}
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          {open && <SidebarGroupLabel>Applications</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_ITEMS.map(
                (item, index) =>
                  item?.allowedFor.includes(user?.user_role?.role_name) && (
                    <SidebarMenuItem
                      key={index}
                      className={`${
                        item.url === pathname ? "bg-muted rounded-md" : ""
                      } flex justify-between items-center`}
                    >
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          {open && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                      {item.url === "/chats" && messageReceivedCount > 0 && (
                        <Badge variant={"destructive"} className="rounded-full">
                          {messageReceivedCount}
                        </Badge>
                      )}
                    </SidebarMenuItem>
                  ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
          {open && isAdmin && (
            <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          )}
          <SidebarGroupContent hidden={!isAdmin}>
            <SidebarMenu>
              {open ? (
                <Collapsible
                  defaultOpen
                  className="group"
                  onOpenChange={handleCollapsibleOpen}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton asChild tooltip="Others">
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-left p-2!"
                        >
                          <span className="flex gap-2 items-center">
                            <MenuIcon className="w-4 h-4" />
                            Others
                          </span>

                          <ChevronRight
                            className={`w-4 h-4 ${
                              isCollapsibleOpen && "rotate-90"
                            } trasition-all duration-300 ease-in-out`}
                          />
                        </Button>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem />
                        {COLLAPSABLE_SIDEBAR_ITEMS?.map((item, index) => (
                          <Link
                            href={item.url}
                            key={index}
                            hidden={item.isSuperAdmin && !isSuperAdmin}
                          >
                            <Button
                              variant="ghost"
                              className={`${
                                item.url === pathname
                                  ? "bg-muted rounded-md"
                                  : ""
                              } w-full justify-start text-left`}
                            >
                              {item.title}
                            </Button>
                          </Link>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                COLLAPSABLE_SIDEBAR_ITEMS?.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      hidden={item.isSuperAdmin && !isSuperAdmin}
                    >
                      <Link
                        href={item.url}
                        className={
                          item.url === pathname ? "bg-muted rounded-md" : ""
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={Storage(user?.user_detail?.profile_pic)}
                  alt="User"
                />
                <AvatarFallback className="border font-bold">
                  {nameShortHand(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex flex-col">
                  <Tooltip>
                    <TooltipTrigger className="text-sm font-medium capitalize w-45 truncate text-start">
                      {user?.full_name}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user?.full_name}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger className="text-xs w-45 text-muted-foreground truncate text-start">
                      {user?.user_detail?.user_email}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user?.user_detail?.user_email}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-semibold text-sm">{user?.full_name}</span>
              <span className="text-xs text-muted-foreground font-normal truncate">
                {user?.user_detail?.user_email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {!isAudit && (
              <DropdownMenuItem className="cursor-pointer gap-2" asChild>
                <Link href={"/profile"}>
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => setIsOpen(true)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
