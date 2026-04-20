import {
  ActivityIcon,
  Building,
  FileUserIcon,
  Home,
  LayoutDashboard,
  MessageCircleMore,
  Notebook,
  ShieldUserIcon,
  TicketCheck,
  Truck,
  UserCog2,
  UserLock,
  Users2,
  UserSearch,
} from "lucide-react";
import { CAN_ACCESS_ALL, CAN_ACCESS_NO_AUDIT } from "./roles";

export const SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    allowedFor: CAN_ACCESS_NO_AUDIT,
  },
  {
    title: "Tickets",
    url: "/tickets",
    icon: TicketCheck,
    allowedFor: CAN_ACCESS_NO_AUDIT,
  },
  {
    title: "Chats",
    url: "/chats",
    icon: MessageCircleMore,
    allowedFor: CAN_ACCESS_NO_AUDIT,
  },
  { title: "Reports", url: "/reports", icon: Home, allowedFor: CAN_ACCESS_ALL },
];

export const COLLAPSABLE_SIDEBAR_ITEMS = [
  { title: "Branches", url: "/admin/branches", icon: Building },
  { title: "Categories", url: "/admin/categories", icon: LayoutDashboard },
  { title: "Suppliers", url: "/admin/suppliers", icon: Truck },
  { title: "Users", url: "/admin/users", icon: Users2 },
  { title: "Automations", url: "/admin/automations", icon: UserCog2 },
  { title: "Accountings", url: "/admin/accountings", icon: UserSearch },
  { title: "CAS", url: "/admin/cas", icon: FileUserIcon },
  { title: "Area Managers", url: "/admin/area-managers", icon: ShieldUserIcon },
  { title: "User Roles", url: "/admin/user-roles", icon: UserLock },
  {
    title: "Activities",
    url: "/super-admin/activities",
    icon: ActivityIcon,
    isSuperAdmin: true,
  },
];
