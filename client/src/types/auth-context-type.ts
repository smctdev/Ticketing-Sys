import { AxiosResponse } from "axios";
import { Dispatch, SetStateAction } from "react";

export interface CredentialType {
  usernameOrEmail: string;
  password: string;
}

export interface AuthContextType {
  user: any | null;
  setUser?: () => Dispatch<SetStateAction<any>>;
  isAuthenticated: boolean;
  setIsAuthenticated?: () => Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  isAdmin: boolean;
  setIsLoading?: () => Dispatch<SetStateAction<boolean>>;
  login: (credentials: CredentialType) => Promise<AxiosResponse<any, any>>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  loginAsOtp: (code: string, email: string) => Promise<AxiosResponse<any, any>>;
  setNotifications: Dispatch<SetStateAction<any | null>>;
  notifications: any | null;
  setTotalUnreadNotifications: Dispatch<SetStateAction<number>>;
  totalUnreadNotifications: number;
  handleUpdateProfile: (data: any) => Promise<AxiosResponse<any, any>>;
}
