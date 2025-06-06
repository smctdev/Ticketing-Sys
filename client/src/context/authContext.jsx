import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchProfile,
  login as loginApi,
  logout as logoutApi,
} from "../lib/sanctum";

const AuthContext = createContext();
const USERINFO_URL = "/login";
const CHECK_COOKIE_URL = "/auth/check-cookie";

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState();
  const [isRefresh, setIsRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleSuccessfulLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProfile();
      if (response.status === 200) {
        setIsAuthenticated(true);
        setUserRole(response.data.user_role.user_role_id);
        setUser(response.data);
        if (response.data.requesting_password === true) {
          navigate("/auth/setup-new-password");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefresh(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSuccessfulLogin();
  }, [isAuthenticated, isRefresh]);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await loginApi({
        usernameOrEmail,
        password,
      });

      if (response.status === 204) {
        setIsAuthenticated(true);
        navigate("/dashboard/home");
        handleSuccessfulLogin();
        return { success: true };
      } else {
        setIsAuthenticated(false);
        return { error: "Invalid credentials" };
      }
    } catch (error) {
      setIsAuthenticated(false);
      return { error: "An error occurred during logins" };
    }
  };

  const logout = async () => {
    try {
      const response = await logoutApi();
      if (response.status === 204) {
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      } else {
        console.error("Logout failed. Status code:", response.status);
      }
    } catch (error) {
      console.error("An error occurred while logging out:", error);
    }
  };

  const contextValue = {
    isAuthenticated,
    userRole,
    login,
    logout,
    user,
    setIsRefresh,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
