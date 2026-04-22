"use client";

import { useAuth } from "@/context/auth-context";
import AdminDashboard from "./_components/admin-dashboard";
import UserDashboard from "./_components/user-dashboard";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import AutomationDashboard from "./_components/automation-dashboard";
import { ROLE } from "@/constants/roles";
import { useEffect } from "react";
import Swal from "sweetalert2";

const Dashboard = () => {
  const { isAdmin, user } = useAuth();
  const { data, isLoading, error } = useFetch({
    url: "/dashboard-data",
  });

  useEffect(() => {
    Swal.close();
  }, []);

  if (isAdmin) {
    return <AdminDashboard data={data} isLoading={isLoading} />;
  } else if (user?.user_role?.role_name === ROLE.AUTOMATION) {
    return <AutomationDashboard data={data} isLoading={isLoading} />;
  } else {
    return <UserDashboard data={data} isLoading={isLoading} error={error} />;
  }
};

export default withAuthPage(Dashboard);
