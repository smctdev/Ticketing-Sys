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
} from "@/lib/sanctum";
import { api } from "@/lib/api";
import { ROLE } from "@/constants/roles";

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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function login(credentials: CredentialType) {
    const response = await sanctumLogin(credentials);

    if (response.status !== 204) return response;

    const profile = await fetchProfile();

    if (profile.status !== 200) return response;

    setUser(profile.data);
    setIsAuthenticated(true);

    if (profile.data.user_role.role_name === ROLE.ADMIN) {
      setIsAdmin(true);
    }

    return response;
  }

  async function fetchUserProfile() {
    try {
      const response = await fetchProfile();

      if (response.status !== 200) return;

      setUser(response.data);
      setIsAuthenticated(true);

      if (response.data.user_role.role_name === ROLE.ADMIN) {
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
    setIsAuthenticated(true);

    if (profile.data.user_role.role_name === ROLE.ADMIN) {
      setIsAdmin(true);
    }

    return response;
  }

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
