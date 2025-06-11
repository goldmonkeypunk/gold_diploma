import React, { useEffect, useState } from "react"
import { getSaved, unsaveSong, SongDTO } from "../api/songs"
import { useAuthContext } from "../context/AuthProvider"
import { Link } from "react-router-dom"

export default function ProfilePage() {
  const { token, logout } = useAuthContext()
  const [songs, setSongs] = useState<SongDTO[]>([])

  async function load() {
    try {
      const data = await getSaved()
      setSongs(data)
    } catch {
      alert("Помилка завантаження")
    }
  }

  useEffect(() => {
    if (token) load()
  }, [token])

  async function remove(id: number) {
    try {
      await unsaveSong(id)
      load()
    } catch {
      alert("Помилка")
    }
  }

  if (!token)
    return (
      <p className="p-4">
        Спершу увійдіть у систему, щоб побачити ваш профіль.
      </p>
    )

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Мій профіль</h2>

      <button
        onClick={logout}
        className="bg-red-600 text-white px-3 py-1 rounded mb-4"
      >
        Вийти
      </button>

      <h3 className="text-xl font-semibold mb-2">Збережені пісні:</h3>

      {songs.length === 0 && <p>Поки що пусто</p>}

      <ul className="space-y-2">
        {songs.map((s) => (
          <li key={s.id} className="flex items-center gap-2 bg-light/5 p-2 rounded">
            <Link to={`/songs/${s.id}`} className="flex-1 hover:underline">
              {s.title}
            </Link>
            <button
              onClick={() => remove(s.id)}
              className="bg-red-600 text-white rounded px-2"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

