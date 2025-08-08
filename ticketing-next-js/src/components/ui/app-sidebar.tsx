import Logo from "@/assets/logo.png";
import {
  ChevronRight,
  Home,
  MenuIcon,
  Notebook,
  TicketCheck,
} from "lucide-react";
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

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Tickets", url: "/tickets", icon: TicketCheck },
  { title: "Reports", url: "/reports", icon: Notebook },
];

const collapsibleItems = [
  { title: "Branches", url: "/branches" },
  { title: "Categories", url: "/categories" },
  { title: "Suppliers", url: "/suppliers" },
  { title: "Users", url: "/users" },
  { title: "Automations", url: "/automations" },
  { title: "Accountings", url: "/accountings" },
  { title: "CAS", url: "/cas" },
  { title: "Area Managers", url: "/area-managers" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { logout, user } = useAuth();
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState<boolean>(true);

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
      <SidebarContent>
        <SidebarGroup>
          {open && <SidebarGroupLabel>Applications</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarMenu>
              <Collapsible
                defaultOpen
                className="group"
                onOpenChange={handleCollapsibleOpen}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-left !p-2"
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
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem />
                      {collapsibleItems?.map((item, index) => (
                        <Link href={item.url} key={index}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left"
                          >
                            {item.title}
                          </Button>
                        </Link>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
                <AvatarImage src={user?.user_detail?.profile_pic} alt="User" />
                <AvatarFallback className="border">
                  {nameShortHand(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              {open && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium capitalize">
                    {user?.full_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.user_detail?.user_email}
                  </span>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
