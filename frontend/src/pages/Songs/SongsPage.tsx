import React, { useEffect, useState } from "react"
import {
  getSongs,
  SongDTO,
  createSong,
  deleteSong,
  saveSong,
  unsaveSong,
} from "../../api/songs"
import SongCard from "../../components/SongCard"
import { useDebounce } from "../../hooks/useDebounce"
import { useAuthContext } from "../../context/AuthProvider"
import { getChords, ChordDTO } from "../../api/chords"

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

  useEffect(() => {
    if (loaded) fetchSongs()
  }, [debounced, genre, chordId, sortAsc])

  /* ---------- load chords for filter ---------- */
  const [chords, setChords] = useState<ChordDTO[]>([])
  useEffect(() => {
    getChords("").then(setChords).catch(() => {})
  }, [])

  /* ---------- admin create modal ---------- */
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [lyrics, setLyrics] = useState("")
  const [newGenre, setNewGenre] = useState("")
  const [selectedChordIds, setSelectedChordIds] = useState<number[]>([])
  const [sheetFile, setSheetFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  async function handleCreate() {
    if (!title || selectedChordIds.length === 0) {
      alert("Заповніть назву і виберіть акорди")
      return
    }
    const fd = new FormData()
    fd.append("title", title)
    fd.append("lyrics", lyrics)
    fd.append("genre", newGenre || "other")
    fd.append("chord_ids", JSON.stringify(selectedChordIds))
    if (sheetFile) fd.append("sheet", sheetFile)
    if (audioFile) fd.append("audio", audioFile)
    try {
      await createSong(fd)
      setShowModal(false)
      setTitle("")
      setLyrics("")
      setNewGenre("")
      setSelectedChordIds([])
      fetchSongs()
    } catch {
      alert("Помилка створення")
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Видалити пісню?")) return
    try {
      await deleteSong(id)
      fetchSongs()
    } catch {
      alert("Помилка видалення")
    }
  }

  async function handleSave(id: number, saved: boolean) {
    try {
      saved ? await unsaveSong(id) : await saveSong(id)
      fetchSongs()
    } catch {
      alert("Помилка")
    }
  }

  /* ---------- track saved -------------------- */
  const [savedIds, setSavedIds] = useState<number[]>([])
  useEffect(() => {
    if (!token) return
    import("../../api/songs")
      .then((m) => m.getSaved())
      .then((list) => setSavedIds(list.map((s) => s.id)))
      .catch(() => {})
  }, [token])

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Каталог пісень</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border p-2 rounded flex-1 min-w-[150px]"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">Усі жанри</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g.toUpperCase()}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={chordId ?? ""}
          onChange={(e) =>
            setChordId(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">Будь‑який акорд</option>
          {chords.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          className="px-3 py-2 bg-light/10 rounded"
          onClick={() => setSortAsc((p) => !p)}
        >
          {sortAsc ? "A→Z" : "Z→A"}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={fetchSongs}
        >
          Показати
        </button>

        {isAdmin && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => setShowModal(true)}
          >
            + Додати
          </button>
        )}
      </div>

      {!loaded && <p>Натисніть “Показати” для завантаження...</p>}
      {loaded && songs.length === 0 && <p>Нічого не знайдено</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {songs.map((s) => (
          <div key={s.id} className="relative">
            <SongCard {...s} />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleSave(s.id, savedIds.includes(s.id))}
                className="bg-accent text-white rounded px-2"
                title="У вибране"
              >
                {savedIds.includes(s.id) ? "−" : "+"}
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(s.id)}
                  className="bg-red-600 text-white rounded px-2"
                  title="Видалити"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- modal create ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-dark p-6 rounded w-96 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2">Нова пісня</h3>

            <input
              className="w-full p-2 border rounded"
              placeholder="Назва"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full p-2 border rounded"
              placeholder="Текст пісні"
              rows={4}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />

            <select
              className="w-full p-2 border rounded"
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
            >
              <option value="">Оберіть жанр</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g.toUpperCase()}
                </option>
              ))}
            </select>

            <label className="block">Виберіть акорди:</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
              {chords.map((c) => (
                <label key={c.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedChordIds.includes(c.id)}
                    onChange={(e) =>
                      setSelectedChordIds((prev) =>
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

            <label>Файл табулатури (png, jpg, pdf):</label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => setSheetFile(e.target.files?.[0] || null)}
            />

            <label>Файл аудіо (mp3, wav, ogg):</label>
            <input
              type="file"
              accept=".mp3,.wav,.ogg"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-light/20 rounded"
              >
                Скасувати
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1 bg-blue-600 text-white rounded"
              >
                Створити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

