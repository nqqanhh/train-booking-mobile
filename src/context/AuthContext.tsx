import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../services/api";
import {
  getMe,
  postLogin,
  postLogout,
  postRefresh,
  postRegister,
} from "../services/authApi";

type User = {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
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
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  bootstrap: async () => {},
});

const ACCESS_KEY = "tk_access";
const REFRESH_KEY = "tk_refresh";

const setAuthHeader = (token?: string) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// axios interceptor: refresh khi 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      const rt = await SecureStore.getItemAsync(REFRESH_KEY);
      if (rt) {
        try {
          const tokens = await postRefresh(rt);
          await SecureStore.setItemAsync(ACCESS_KEY, tokens.access_token);
          if (tokens.refresh_token)
            await SecureStore.setItemAsync(REFRESH_KEY, tokens.refresh_token);
          setAuthHeader(tokens.access_token);
          original.headers.Authorization = `Bearer ${tokens.access_token}`;
          return api(original); // retry
        } catch (e) {
          // refresh fail -> signout
          await SecureStore.deleteItemAsync(ACCESS_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
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
  const [loading, setLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      setLoading(true);
      const access = await SecureStore.getItemAsync(ACCESS_KEY);
      if (access) {
        setAuthHeader(access);
        const me = await getMe();
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const tk = await postLogin({ email, password });
    await SecureStore.setItemAsync(ACCESS_KEY, tk.access_token);
    if (tk.refresh_token)
      await SecureStore.setItemAsync(REFRESH_KEY, tk.refresh_token);
    setAuthHeader(tk.access_token);
    const me = await getMe();
    setUser(me);
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

  const logout = useCallback(async () => {
    try {
      await postLogout();
    } catch {}
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    setAuthHeader(undefined);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, register, bootstrap }),
    [user, loading, login, logout, register, bootstrap]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
