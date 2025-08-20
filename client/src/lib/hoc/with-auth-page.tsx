import Unauthorized from "@/app/unauthorized";
import PreLoader from "@/components/loaders/pre-loader";
import { ROLE } from "@/constants/roles";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function withAuthPage(
  WrappedComponent: any,
  isAdminPage?: boolean
) {
  function AppWrappedComponent(props: any) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const isAlreadyAuthenticated = isAuthenticated && user;

    useEffect(() => {
      if (isLoading) return;

      if (!isAlreadyAuthenticated) router.replace("/login");
    }, [isAlreadyAuthenticated, router, isLoading]);

    if (isLoading || !isAlreadyAuthenticated) {
      return <PreLoader />;
    }

    if (isAdminPage && user.user_role.role_name !== ROLE.ADMIN) {
      return <Unauthorized />;
    }

    return <WrappedComponent {...props} />;
  }
  return AppWrappedComponent;
}
