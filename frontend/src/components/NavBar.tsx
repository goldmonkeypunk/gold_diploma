import React from "react"
import { Link, NavLink } from "react-router-dom"
import { useAuthContext } from "../context/AuthProvider"

const linkClass =
  "px-3 py-1 rounded hover:bg-accent/20 transition font-medium"

export default function NavBar() {
  const { token } = useAuthContext()

  return (
    <nav className="bg-light/10 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center gap-4 py-2 px-4">
        <Link to="/" className="text-2xl font-bold">
          🎸&nbsp;Portal
        </Link>

        <NavLink to="/chords" className={linkClass}>
          Акорди
        </NavLink>

        <NavLink to="/songs" className={linkClass}>
          Пісні
        </NavLink>

        <div className="flex-1" />

        {token ? (
          <NavLink to="/profile" className={linkClass}>
            Профіль
          </NavLink>
        ) : (
          <>
            <NavLink to="/login" className={linkClass}>
              Увійти
            </NavLink>
            <NavLink to="/register" className={linkClass}>
              Реєстрація
            </NavLink>
          </>
        )}
      </div>
    </nav>
  )
}
