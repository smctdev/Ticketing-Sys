import { api, sanctum } from "@/api/axios";

export const getCsrfToken = async () => {
  await sanctum.get("/sanctum/csrf-cookie");
};

export const login = async (credentials) => {
  await getCsrfToken();
  return api.post("/login", credentials);
};

export const logout = () => {
  return api.post("/logout");
};

export const fetchProfile = () => {
  return api.get("/profile");
};
