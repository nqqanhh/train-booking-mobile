// src/context/AuthContext.tsx
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
  patchUpdateProfile,
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
  phone: string;
  full_name?: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  hydrate: boolean;

  // auth
  login: (email: string, password: string) => Promise<void>;
  register: (
    full_name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  getMyProfile: () => Promise<void>;
  bootstrap: () => Promise<void>;

  //update profile
  updateProfile: (
    full_name: string,
    email: string,
    phone: string
  ) => Promise<void>;

  // forgot/reset
  resetEmail: string;
  setResetEmail: (v: string) => void;
  resetToken: string;
  setResetToken: (v: string) => void;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (
    email: string,
    reset_token: string,
    new_password: string
  ) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as any);

// storage keys
const ACCESS_KEY = "tk_access";
const REFRESH_KEY = "tk_refresh";

const isWeb = Platform.OS === "web";

// cross-platform storage wrapper
const Secure = {
  getItemAsync: async (key: string) =>
    isWeb
      ? Promise.resolve(localStorage.getItem(key))
      : SecureStore.getItemAsync(key),
  setItemAsync: async (key: string, value: string) =>
    isWeb
      ? Promise.resolve(localStorage.setItem(key, value))
      : SecureStore.setItemAsync(key, value),
  deleteItemAsync: async (key: string) =>
    isWeb
      ? Promise.resolve(localStorage.removeItem(key))
      : SecureStore.deleteItemAsync(key),
};

const setAuthHeader = (token?: string) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// Attach ONE global interceptor to refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      const rt = await Secure.getItemAsync(REFRESH_KEY);
      if (rt) {
        try {
          const tokens = await postRefresh(rt);
          await Secure.setItemAsync(ACCESS_KEY, tokens.access_token);
          if (tokens.refresh_token) {
            await Secure.setItemAsync(REFRESH_KEY, tokens.refresh_token);
          }
          setAuthHeader(tokens.access_token);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${tokens.access_token}`;
          return api(original); // retry original request
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
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetToken, setResetToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [hydrate, setHydrate] = useState(false);

  // bootstrap: restore tokens -> get profile
  const bootstrap = useCallback(async () => {
    try {
      setLoading(true);
      const access = await Secure.getItemAsync(ACCESS_KEY);
      if (access) {
        setAuthHeader(access);
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          setUser(null);
          setAuthHeader(undefined);
          await Secure.deleteItemAsync(ACCESS_KEY);
          await Secure.deleteItemAsync(REFRESH_KEY);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
      setHydrate(true); // IMPORTANT: avoid blank screen
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const tk = await postLogin({ email, password }); // sẽ throw nếu 401
      await Secure.setItemAsync(ACCESS_KEY, tk.tokens.access_token);
      if (tk.tokens.refresh_token)
        await Secure.setItemAsync(REFRESH_KEY, tk.tokens.refresh_token);
      setAuthHeader(tk.tokens.access_token);

      const me = await getMe();
      setUser(me);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Email hoặc mật khẩu không đúng";
      throw new Error(msg); // <<< quan trọng
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
      // không auto-login: chuyển sang màn login sau khi đăng ký
    },
    []
  );

  const getMyProfile = useCallback(async () => {
    const me = await getMe();
    setUser(me);
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    await postRequestOtp({ email });
    setResetEmail(email);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await postVerifyOtp({ email, otp });
    setResetToken(res.reset_token);
    if (isWeb) localStorage.setItem("resetToken", res.reset_token);
  }, []);

  const resetPassword = useCallback(
    async (email: string, reset_token: string, new_password: string) => {
      await postResetPassword({ email, reset_token, new_password });
      if (isWeb) localStorage.removeItem("resetToken");
    },
    []
  );

  const updateProfile = useCallback(
    async (fullName: string, email: string, phone: string) => {
      try {
        await patchUpdateProfile({ fullName, email, phone });
      } catch (e) {
        throw e;
      }
      try {
        const fresh = await getMe();
        setUser(fresh ? { ...fresh } : null);
      } catch (e) {}
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
      // auth
      login,
      register,
      logout,
      getMyProfile,
      bootstrap,
      //update profile
      updateProfile,
      // forgot/reset
      resetEmail,
      setResetEmail,
      resetToken,
      setResetToken,
      requestOtp,
      verifyOtp,
      resetPassword,
    }),
    [
      user,
      loading,
      hydrate,
      login,
      register,
      logout,
      getMyProfile,
      bootstrap,
      updateProfile,
      resetEmail,
      resetToken,
      requestOtp,
      verifyOtp,
      resetPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
