import Unauthorized from "@/app/unauthorized";
import PreLoader from "@/components/loaders/pre-loader";
import { ROLE } from "@/constants/roles";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function withAuthPage(
  WrappedComponent: any,
  isProtected = false
) {
  function AppWrappedComponent(props: any) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const isAlreadyAuthenticated = isAuthenticated && user;
    const noAccess =
      isProtected &&
      ![ROLE.ADMIN, ROLE.AUTOMATION_ADMIN].includes(user?.user_role?.role_name);

    useEffect(() => {
      if (isLoading) return;

      if (!isAlreadyAuthenticated) router.replace("/login");
    }, [isAlreadyAuthenticated, router, isLoading]);

    if (isLoading || !isAlreadyAuthenticated) {
      return <PreLoader />;
    }

    if (noAccess) {
      return <Unauthorized />;
    }

    return <WrappedComponent {...props} />;
  }
  return AppWrappedComponent;
}
