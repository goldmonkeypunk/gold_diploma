
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

export interface TokenResponse {
  access_token: string
  token_type: string
}

export async function login(username: string, password: string) {
  const { data } = await api.post<TokenResponse>("/login", {
    username,
    password,
  })
  return data
}

export async function register(username: string, password: string) {
  const { data } = await api.post("/register", {
    username,
    password,
  })
  return data
}

export function setAuthHeader(token: string) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}
