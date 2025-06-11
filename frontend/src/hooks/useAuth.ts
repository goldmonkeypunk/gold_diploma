import { useState, useEffect } from "react"
import { login as apiLogin, register as apiRegister, setAuthHeader } from "../api/auth"

export function useAuth() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("access_token")
    if (saved) {
      setToken(saved)
      setAuthHeader(saved)
    }
  }, [])

  async function login(username: string, password: string) {
    const data = await apiLogin(username, password)
    localStorage.setItem("access_token", data.access_token)
    setAuthHeader(data.access_token)
    setToken(data.access_token)
  }

  async function register(username: string, password: string) {
    await apiRegister(username, password)
    await login(username, password)
  }

  function logout() {
    localStorage.removeItem("access_token")
    setAuthHeader("")
    setToken(null)
  }

  return { token, login, register, logout }
}
