import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, setAuthHeader, AuthResponse } from "../api/auth";

interface AuthContextValue {
  token: string | null;
  isAuth: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  /* завантажуємо токен з localStorage один раз */
  useEffect(() => {
    const stored = localStorage.getItem("access_token");
    if (stored) {
      setToken(stored);
      setAuthHeader(stored);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res: AuthResponse = await apiLogin({ username, password });
    localStorage.setItem("access_token", res.access_token);
    setAuthHeader(res.access_token);
    setToken(res.access_token);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setAuthHeader(null);
    setToken(null);
  };

  const value: AuthContextValue = {
    token,
    isAuth: token !== null,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* зручний хук */
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
