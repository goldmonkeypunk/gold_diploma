import { useState, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  setAuthHeader,
  AuthResponse
} from "../api/auth";

import { useAuthContext } from "../context/AuthProvider";

/* ------------------------------------------------------------------ */
/* 1. Локальний хук, що працює і без провайдера                        */
/* ------------------------------------------------------------------ */

export function useLocalAuth() {
  const [token, setToken] = useState<string | null>(null);

  /* читаємо токен з localStorage один раз при монтуванні */
  useEffect(() => {
    const saved = localStorage.getItem("access_token");
    if (saved) {
      setToken(saved);
      setAuthHeader(saved);
    }
  }, []);

  async function login(username: string, password: string) {
    const data: AuthResponse = await apiLogin({ username, password });
    localStorage.setItem("access_token", data.access_token);
    setAuthHeader(data.access_token);
    setToken(data.access_token);
  }

  async function register(username: string, password: string) {
    await apiRegister({ username, password });
    await login(username, password);
  }

  function logout() {
    localStorage.removeItem("access_token");
    setAuthHeader(null);
    setToken(null);
  }

  return { token, isAuth: token !== null, login, register, logout };
}

/* ------------------------------------------------------------------ */
/* 2. Основний хук із контексту 
/* ------------------------------------------------------------------ */

export const useAuth = useAuthContext;

export default useAuth;
