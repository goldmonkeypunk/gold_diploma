import React from "react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[85vh] gap-10">
      <h1 className="text-4xl font-extrabold text-accent drop-shadow">
        Гітарний портал
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Link
          to="/chords"
          className="relative group w-64 h-40 rounded-xl bg-light/10 backdrop-blur hover:scale-105 transition p-6 flex items-end"
        >
          <span className="text-2xl font-semibold">Бібліотека акордів</span>
          <span className="absolute inset-0 rounded-xl border-2 border-light opacity-0 group-hover:opacity-100 transition"></span>
        </Link>

        <Link
          to="/songs"
          className="relative group w-64 h-40 rounded-xl bg-light/10 backdrop-blur hover:scale-105 transition p-6 flex items-end"
        >
          <span className="text-2xl font-semibold">Каталог пісень</span>
          <span className="absolute inset-0 rounded-xl border-2 border-light opacity-0 group-hover:opacity-100 transition"></span>
        </Link>
      </div>

      <Link
        to="/profile"
        className="mt-10 text-lg underline hover:text-accent transition"
      >
        Перейти до профілю
      </Link>
    </div>
  )
}
