import {
  Building,
  FileUserIcon,
  Home,
  LayoutDashboard,
  Notebook,
  ShieldUserIcon,
  TicketCheck,
  UserCog2,
  Users2,
  UserSearch,
  UserStar,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Tickets", url: "/tickets", icon: TicketCheck },
  { title: "Reports", url: "/reports", icon: Notebook },
];

export const COLLAPSABLE_SIDEBAR_ITEMS = [
  { title: "Branches", url: "/branches", icon: Building },
  { title: "Categories", url: "/categories", icon: LayoutDashboard },
  { title: "Suppliers", url: "/suppliers", icon: UserStar },
  { title: "Users", url: "/users", icon: Users2 },
  { title: "Automations", url: "/automations", icon: UserCog2 },
  { title: "Accountings", url: "/accountings", icon: UserSearch },
  { title: "CAS", url: "/cas", icon: FileUserIcon },
  { title: "Area Managers", url: "/area-managers", icon: ShieldUserIcon },
];
