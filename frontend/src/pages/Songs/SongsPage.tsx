import React, { useEffect, useState } from "react"
import {
  getSongs,
  SongDTO,
  createSong,
  deleteSong,
  saveSong,
  unsaveSong,
} from "../../api/songs"
import { getChords, ChordDTO } from "../../api/chords"
import SongCard from "../../components/SongCard"
import { useDebounce } from "../../hooks/useDebounce"
import { useAuthContext } from "../../context/AuthProvider"

const GENRES = ["rock", "pop", "jazz", "classic", "other"]

export default function SongsPage() {
  const { token } = useAuthContext()

  const [songs, setSongs] = useState<SongDTO[]>([])
  const [search, setSearch] = useState("")
  const [genre, setGenre] = useState("")
  const [chordId, setChordId] = useState<number | undefined>(undefined)
  const [sortAsc, setSortAsc] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const debounced = useDebounce(search, 400)

  const isAdmin = (() => {
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.role === "admin"
    } catch {
      return false
    }
  })()

  async function fetchSongs() {
    try {
      const data = await getSongs({
        search: debounced || undefined,
        genre: genre || undefined,
        chord_id: chordId,
      })
      setSongs(
        data.sort((a, b) =>
          sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
        )
      )
      setLoaded(true)
    } catch {
      alert("Помилка завантаження")
    }
  }

  /* ---- chords for filter ---- */
  const [chords, setChords] = useState<ChordDTO[]>([])
  useEffect(() => {
    getChords("").then(setChords).catch(() => {})
  }, [])

  /* ---- saved ids ---- */
  const [saved, setSaved] = useState<number[]>([])
  useEffect(() => {
    if (!token) return
    import("../../api/songs")
      .then((m) => m.getSaved())
      .then((list) => setSaved(list.map((s) => s.id)))
      .catch(() => {})
  }, [token])

  /* ---- admin modal ---- */
  const [show, setShow] = useState(false)
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [newGenre, setNewGenre] = useState("")
  const [selChordIds, setSelChordIds] = useState<number[]>([])
  const [sheetFile, setSheetFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  async function handleCreate() {
    if (!title || selChordIds.length === 0) {
      alert("Назва + акорди обов’язкові")
      return
    }
    const fd = new FormData()
    fd.append("title", title)
    fd.append("lyrics", lyrics)
    fd.append("genre", newGenre || "other")
    fd.append("chord_ids", JSON.stringify(selChordIds))
    if (sheetFile) fd.append("sheet", sheetFile)
    if (audioFile) fd.append("audio", audioFile)
    try {
      await createSong(fd)
      setShow(false)
      fetchSongs()
    } catch {
      alert("Помилка створення")
    }
  }

  /* ---- helpers ---- */
  async function toggleSave(id: number) {
    try {
      if (saved.includes(id)) {
        await unsaveSong(id)
      } else {
        await saveSong(id)
      }
      fetchSongs()
    } catch {
      alert("Помилка")
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Видалити пісню?")) return
    await deleteSong(id).then(fetchSongs).catch(() => alert("Помилка"))
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Каталог пісень</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук..."
          className="border p-2 rounded flex-1 min-w-[150px]"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Усі жанри</option>
          {GENRES.map((g) => (
            <option key={g}>{g.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={chordId ?? ""}
          onChange={(e) =>
            setChordId(e.target.value ? Number(e.target.value) : undefined)
          }
          className="border p-2 rounded"
        >
          <option value="">Будь‑який акорд</option>
          {chords.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={() => setSortAsc((p) => !p)} className="px-3 py-2 bg-light/10 rounded">
          {sortAsc ? "A→Z" : "Z→A"}
        </button>
        <button onClick={fetchSongs} className="px-4 py-2 bg-blue-600 text-white rounded">
          Показати
        </button>
        {isAdmin && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => setShow(true)}
          >
            + Додати
          </button>
        )}
      </div>

      {!loaded && <p>Натисніть “Показати”...</p>}
      {loaded && songs.length === 0 && <p>Нічого не знайдено</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {songs.map((s) => (
          <div key={s.id} className="relative">
            <SongCard {...s} />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                className="bg-accent text-white px-2 rounded"
                onClick={() => toggleSave(s.id)}
              >
                {saved.includes(s.id) ? "−" : "+"}
              </button>
              {isAdmin && (
                <button
                  className="bg-red-600 text-white px-2 rounded"
                  onClick={() => handleDelete(s.id)}
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-dark p-6 rounded w-96 max-h-[90vh] overflow-y-auto space-y-3">
            <h3 className="text-xl font-bold">Нова пісня</h3>
            <input
              placeholder="Назва"
              className="w-full p-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Текст"
              className="w-full p-2 border rounded"
              rows={4}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />
            <select
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Оберіть жанр</option>
              {GENRES.map((g) => (
                <option key={g}>{g.toUpperCase()}</option>
              ))}
            </select>
            <label>Акорди:</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
              {chords.map((c) => (
                <label key={c.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selChordIds.includes(c.id)}
                    onChange={(e) =>
                      setSelChordIds((prev) =>
                        e.target.checked
                          ? [...prev, c.id]
                          : prev.filter((x) => x !== c.id)
                      )
                    }
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
            <label>Sheet (png/jpg/pdf):</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => setSheetFile(e.target.files?.[0] || null)}
            />
            <label>Audio (mp3/wav/ogg):</label>
            <input
              type="file"
              accept=".mp3,.wav,.ogg"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1 bg-light/20 rounded" onClick={() => setShow(false)}>
                Скасувати
              </button>
              <button className="px-4 py-1 bg-blue-600 text-white rounded" onClick={handleCreate}>
                Створити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
