import React, { createContext, useContext } from "react"
import { useAuth } from "../hooks/useAuth"

interface AuthCtx {
  token: string | null
  login: (u: string, p: string) => Promise<void>
  register: (u: string, p: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx>({
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>
}

export function useAuthContext() {
  return useContext(Ctx)
}
