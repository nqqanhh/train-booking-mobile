import { api } from "./api";

export type LoginReq = { email: string; phone: string; password: string };
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
export type UpdateProfileReq = {
  fullName: string;
  email: string;
  phone: string;
};
export type OtpReq = { email: string };
export type OtpVerify = { email: string; otp: string };
export type ResetPass = {
  email: string;
  reset_token: string;
  new_password: string;
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
  try {
    const { data } = await api.get("/profile/me");
    console.log("me:", data?.profile);
    return data?.profile ?? null;
  } catch (e: any) {
    if (e?.response?.status === 401) return null; // chưa đăng nhập / token hết hạn
    throw e;
  }
};

export const patchUpdateProfile = async (payload: UpdateProfileReq) => {
  try {
    const { data } = await api.patch("/profile/me", payload);
    // console.log("data:", data);
    return data?.profile;
  } catch (e: any) {
    if (e?.response?.status === 401) return null; // chưa đăng nhập / token hết hạn
    throw e;
  }
};
export const postRefresh = async (refresh_token: string) => {
  const { data } = await api.post<AuthTokens>("/auth/refresh", {
    refresh_token,
  });
  return data;
};

export const postLogout = async () => {
  await localStorage.removeItem("tk_access");
  await localStorage.removeItem("tk_refresh");
};

export const postRequestOtp = async (payload: OtpReq) => {
  const { data } = await api.post("/auth/otp/request", payload);
  return data;
};
export const postVerifyOtp = async (payload: OtpVerify) => {
  const { data } = await api.post("/auth/otp/verify", payload);
  return data;
};

export const postResetPassword = async (payload: ResetPass) => {
  const data = await api.post("/auth/password/reset", payload);
  return data;
};
