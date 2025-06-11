import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" }
});

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number; // секунд
}

export async function login(data: LoginPayload) {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
}

export async function register(data: LoginPayload) {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
}

export function setAuthHeader(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
