"use client";

import { useAuth } from "@/context/auth-context";
import appPage from "@/lib/hoc/with-auth-page";
import AdminDashboard from "./_components/admin-dashboard";
import UserDashboard from "./_components/user-dashboard";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useFetch({
    url: "/dashboard-data",
  });
  if (isAdmin) return <AdminDashboard data={data} isLoading={isLoading} />;
  return <UserDashboard data={data} isLoading={isLoading} />;
};

export default withAuthPage(Dashboard);
