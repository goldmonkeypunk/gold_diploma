import React, { useEffect, useState } from "react"
import { getSaved, unsaveSong, SongDTO } from "../api/songs"
import { getSavedChords, unsaveChord, ChordDTO } from "../api/chords"
import { useAuthContext } from "../context/AuthProvider"
import { Link } from "react-router-dom"

export default function ProfilePage() {
  const { token, logout } = useAuthContext()
  const [songs, setSongs] = useState<SongDTO[]>([])
  const [chords, setChords] = useState<ChordDTO[]>([])

  async function load() {
    try {
      const [s, c] = await Promise.all([getSaved(), getSavedChords()])
      setSongs(s)
      setChords(c)
    } catch {
      alert("Помилка завантаження")
    }
  }

  useEffect(() => {
    if (token) load()
  }, [token])

  async function removeSong(id: number) {
    await unsaveSong(id).catch(() => alert("Помилка"))
    load()
  }
  async function removeChord(id: number) {
    await unsaveChord(id).catch(() => alert("Помилка"))
    load()
  }

  if (!token)
    return <p className="p-4">Спершу увійдіть, щоб побачити профіль.</p>

  return (
    <div className="p-4 space-y-6">
      <button
        onClick={logout}
        className="bg-red-600 text-white px-3 py-1 rounded mb-2"
      >
        Вийти
      </button>

      <section>
        <h3 className="text-xl font-bold mb-2">Збережені пісні</h3>
        {songs.length === 0 && <p>Поки що пусто</p>}
        <ul className="space-y-2">
          {songs.map((s) => (
            <li key={s.id} className="flex items-center gap-2 bg-light/5 p-2 rounded">
              <Link to={`/songs/${s.id}`} className="flex-1 hover:underline">
                {s.title}
              </Link>
              <button
                onClick={() => removeSong(s.id)}
                className="bg-red-600 text-white px-2 rounded"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-2">Збережені акорди</h3>
        {chords.length === 0 && <p>Поки що пусто</p>}
        <ul className="space-y-2">
          {chords.map((c) => (
            <li key={c.id} className="flex items-center gap-2 bg-light/5 p-2 rounded">
              <Link to={`/chords/${c.id}`} className="flex-1 hover:underline">
                {c.name}
              </Link>
              <button
                onClick={() => removeChord(c.id)}
                className="bg-red-600 text-white px-2 rounded"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
