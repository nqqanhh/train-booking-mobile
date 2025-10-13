import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { api } from "../services/api";
import {
  getMe,
  postLogin,
  postLogout,
  postRefresh,
  postRegister,
  postRequestOtp,
  postResetPassword,
  postVerifyOtp,
} from "../services/authApi";

type User = {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (
    new_password: string,
    email: string,
    reset_token: string
  ) => Promise<void>;
  resetEmail: string | "";
  setResetEmail: string | "";
  resetToken: string;
  setResetToken: string;
  loading: boolean;
  hydrate: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    full_name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  requestOtp: async () => {},
  verifyOtp: async () => {},
  resetPassword: async () => {},
  resetEmail: "",
  setResetEmail: "",
  resetToken: "",
  setResetToken: "",
  loading: true,
  hydrate: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  bootstrap: async () => {},
});

const ACCESS_KEY = "tk_access";
const REFRESH_KEY = "tk_refresh";

const isWeb = Platform.OS === "web";

// Fallback cho web
const Secure = {
  getItemAsync: async (key: string) =>
    isWeb ? localStorage.getItem(key) : SecureStore.getItemAsync(key),
  setItemAsync: async (key: string, value: string) =>
    isWeb
      ? localStorage.setItem(key, value)
      : SecureStore.setItemAsync(key, value),
  deleteItemAsync: async (key: string) =>
    isWeb ? localStorage.removeItem(key) : SecureStore.deleteItemAsync(key),
};

const setAuthHeader = (token?: string) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// Interceptor tự refresh token khi 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      const rt = await Secure.getItemAsync(REFRESH_KEY);
      if (rt) {
        try {
          const tokens = await postRefresh(rt);
          await Secure.setItemAsync(ACCESS_KEY, tokens.access_token);
          if (tokens.refresh_token)
            await Secure.setItemAsync(REFRESH_KEY, tokens.refresh_token);
          setAuthHeader(tokens.access_token);
          original.headers.Authorization = `Bearer ${tokens.access_token}`;
          return api(original); // retry
        } catch {
          await Secure.deleteItemAsync(ACCESS_KEY);
          await Secure.deleteItemAsync(REFRESH_KEY);
          setAuthHeader(undefined);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(null);
  const [resetEmail, setResetEmail] = useState<string | "">("");
  const [resetToken, setResetToken] = useState<string | "">("");
  const [loading, setLoading] = useState(true);
  const [hydrate, setHydrate] = useState(false);

  // khởi động app: load token -> lấy profile
  const bootstrap = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[AUTH] bootstrap start");
      const access = await Secure.getItemAsync(ACCESS_KEY);
      if (access) {
        setAuthHeader(access);
        try {
          const me = await getMe();
          setUser(me);
          console.log("[AUTH] bootstrap me ok", me?.email);
        } catch (e: any) {
          console.log("[AUTH] bootstrap getMe fail", e?.response?.status);
          setUser(null);
          setAuthHeader(undefined);
          await Secure.deleteItemAsync(ACCESS_KEY);
          await Secure.deleteItemAsync(REFRESH_KEY);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.log("[AUTH] bootstrap error", e);
      setUser(null);
    } finally {
      setLoading(false);
      setHydrate(true); // <-- bắt buộc ở finally
      console.log("[AUTH] bootstrap done -> hydrate=true");
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const tk = await postLogin({ email, password });
      await Secure.setItemAsync(ACCESS_KEY, tk.tokens.access_token);
      if (tk.tokens.refresh_token)
        await Secure.setItemAsync(REFRESH_KEY, tk.tokens.refresh_token);
      setAuthHeader(tk.tokens.access_token);
      const me = await getMe();
      setUser(me);
    } catch (error: any) {
      console.log("Login error:", error?.message || error);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (
      full_name: string,
      email: string,
      phone: string,
      password: string
    ) => {
      await postRegister({ full_name, email, phone, password });
    },
    []
  );

  const requestOtp = useCallback(async (email: string) => {
    await postRequestOtp({ email });
    await setResetEmail(email);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await postVerifyOtp({ email, otp });
    // console.log(`email: ${email}, otp:${otp}, reset_token:${res.reset_token}`)
    await setResetToken(res.reset_token);
    console.log(`resetToken: ${resetToken}`);
    await localStorage.setItem("resetToken", res.reset_token);
  }, []);

  const resetPassword = useCallback(
    async (email: string, reset_token: string, new_password: string) => {
      const res = await postResetPassword({
        email,
        reset_token,
        new_password,
      });
      console.log(
        `email:${email}, reset_token:${reset_token}, new_password:${new_password}`
      );
      console.log("Reset password success:", res);
      await localStorage.removeItem("resetToken");
    },
    []
  );
  const logout = useCallback(async () => {
    try {
      await postLogout();
    } catch {}
    await Secure.deleteItemAsync(ACCESS_KEY);
    await Secure.deleteItemAsync(REFRESH_KEY);
    setAuthHeader(undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      hydrate,
      login,
      logout,
      register,
      requestOtp,
      verifyOtp,
      resetPassword,
      bootstrap,
    }),
    [
      user,
      loading,
      hydrate,
      login,
      logout,
      register,
      requestOtp,
      verifyOtp,
      resetPassword,
      bootstrap,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
