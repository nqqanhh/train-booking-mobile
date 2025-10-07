import { api } from "./api";

export type LoginReq = { email: string; password: string };
export type RegisterReq = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};
export type AuthTokens = { access_token: string; refresh_token?: string };
export type Me = {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
};

export const postLogin = async (payload: LoginReq) => {
  const { data } = await api.post<AuthTokens>("/auth/login", payload);
  return data;
};

export const postRegister = async (payload: RegisterReq) => {
  const { data } = await api.post("/auth/signup", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await api.get<Me>("/my/profile");
  return data;
};

export const postRefresh = async (refresh_token: string) => {
  const { data } = await api.post<AuthTokens>("/auth/refresh", {
    refresh_token,
  });
  return data;
};

export const postLogout = async () => {
  const { data } = await api.post("/auth/logout", {});
  return data;
};
