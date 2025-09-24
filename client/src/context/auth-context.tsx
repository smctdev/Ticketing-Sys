"use client";

import { AuthContextType, CredentialType } from "@/types/auth-context-type";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  login as sanctumLogin,
  logout as sanctumLogout,
  fetchProfile,
  updateProfile,
} from "@/lib/sanctum";
import { api } from "@/lib/api";
import { ROLE } from "@/constants/roles";
import echo from "@/lib/echo";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any | null>(null);
  const [totalUnreadNotifications, setTotalUnreadNotifications] =
    useState<number>(0);
  const isAdminOrAutomationAdmin = [ROLE.ADMIN, ROLE.AUTOMATION_ADMIN];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!echo || !user) return;

    echo
      .private(`updated-user-${user?.login_id}`)
      .notification((notification: any) => {
        setUser(notification.data);

        if (
          isAdminOrAutomationAdmin.includes(
            notification.data.user_role.role_name
          )
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      });

    return () => {
      echo.leave(`updated-user-${user?.id}`);
    };
  }, [echo, user]);

  async function login(credentials: CredentialType) {
    const response = await sanctumLogin(credentials);

    if (response.status !== 204) return response;

    const profile = await fetchProfile();

    if (profile.status !== 200) return response;

    setUser(profile.data);
    setNotifications(profile.data.unread_notifications);
    setTotalUnreadNotifications(profile.data.unread_notifications_count);
    setIsAuthenticated(true);

    if (isAdminOrAutomationAdmin.includes(profile.data.user_role.role_name)) {
      setIsAdmin(true);
    }

    return response;
  }

  async function fetchUserProfile() {
    try {
      const response = await fetchProfile();

      if (response.status !== 200) return;

      setUser(response.data);
      setNotifications(response.data.unread_notifications);
      setTotalUnreadNotifications(response.data.unread_notifications_count);
      setIsAuthenticated(true);

      if (
        isAdminOrAutomationAdmin.includes(response.data.user_role.role_name)
      ) {
        setIsAdmin(true);
      }
    } catch (error: any) {
      console.error(error);
      if (error.response.status === 401) {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      const response = await sanctumLogout();
      if (response.status === 204) {
        setUser(null);
        setNotifications(null);
        setTotalUnreadNotifications(0);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loginAsOtp(code: string, email: string) {
    const response = await api.post("/submit-otp-login", { otp: code, email });
    if (response.status !== 200) return response;

    const profile = await fetchProfile();

    if (profile.status !== 200) return response;

    setUser(profile.data);
    setNotifications(profile.data.unread_notifications);
    setTotalUnreadNotifications(profile.data.unread_notifications_count);
    setIsAuthenticated(true);

    if (isAdminOrAutomationAdmin.includes(profile.data.user_role.role_name)) {
      setIsAdmin(true);
    }

    return response;
  }

  const handleUpdateProfile = async (data: any) => {
    const response = await updateProfile(data);
    if (response.status === 201) {
      setUser(response.data.data);
      setNotifications(response.data.data.unread_notifications);
      setTotalUnreadNotifications(
        response.data.data.unread_notifications_count
      );
      setIsAuthenticated(true);

      if (
        isAdminOrAutomationAdmin.includes(
          response.data.data.user_role.role_name
        )
      ) {
        setIsAdmin(true);
      }
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        fetchUserProfile,
        loginAsOtp,
        notifications,
        setNotifications,
        setTotalUnreadNotifications,
        totalUnreadNotifications,
        handleUpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};
