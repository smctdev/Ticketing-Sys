import PreLoader from "@/components/loaders/pre-loader";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function appPage(WrappedComponent: any) {
  function AppWrappedComponent(props: any) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const isAlreadyAuthenticated = isAuthenticated && user;

    useEffect(() => {
      if (isAlreadyAuthenticated || isLoading) return;

      router.replace("/login");
    }, [isAlreadyAuthenticated, router, isLoading]);

    if (isLoading || !isAlreadyAuthenticated) {
      return <PreLoader />;
    }

    return <WrappedComponent {...props} />;
  }
  return AppWrappedComponent;
}
