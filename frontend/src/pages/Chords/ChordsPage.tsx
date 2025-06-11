import React, { useEffect, useState } from "react"
import {
  getChords,
  ChordDTO,
  createChord,
  deleteChord,
  saveChord,
} from "../../api/chords"
import ChordCard from "../../components/ChordCard"
import { useDebounce } from "../../hooks/useDebounce"
import { useAuthContext } from "../../context/AuthProvider"

export default function ChordsPage() {
  const { token } = useAuthContext()
  const [chords, setChords] = useState<ChordDTO[]>([])
  const [search, setSearch] = useState("")
  const [sortAsc, setSortAsc] = useState(true)
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

  async function fetchData() {
    try {
      const data = await getChords(debounced)
      setChords(
        data.sort((a, b) =>
          sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        )
      )
    } catch {
      alert("Помилка завантаження")
    }
  }

  useEffect(() => {
    fetchData()
  }, [debounced, sortAsc])

  /* ----- admin create ----- */
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newStrings, setNewStrings] = useState<string>("")
  const [newDesc, setNewDesc] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  async function handleCreate() {
    const arr = newStrings.split(",").map((n) => Number(n.trim()))
    if (arr.length !== 6 || arr.some((n) => n < -1 || n > 24)) {
      alert("Strings мають бути 6 чисел -1…24")
      return
    }
    const fd = new FormData()
    fd.append("name", newName)
    fd.append("strings", JSON.stringify(arr))
    fd.append("description", newDesc)
    if (imageFile) fd.append("image_url", imageFile)
    if (audioFile) fd.append("audio_url", audioFile)
    try {
      await createChord(fd)
      setShowModal(false)
      setNewName("")
      setNewStrings("")
      setNewDesc("")
      fetchData()
    } catch {
      alert("Помилка створення")
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Видалити акорд?")) return
    try {
      await deleteChord(id)
      fetchData()
    } catch {
      alert("Помилка видалення")
    }
  }

  async function handleSave(id: number) {
    try {
      await saveChord(id)
      alert("Додано у ваш список")
    } catch {
      alert("Помилка збереження")
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Бібліотека акордів</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="px-3 py-2 bg-light/10 rounded"
          onClick={() => setSortAsc((p) => !p)}
        >
          {sortAsc ? "A→Z" : "Z→A"}
        </button>
        {isAdmin && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => setShowModal(true)}
          >
            + Додати
          </button>
        )}
      </div>

      {chords.length === 0 && <p>Нічого не знайдено</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {chords.map((ch) => (
          <div key={ch.id} className="relative">
            <ChordCard {...ch} />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleSave(ch.id)}
                className="bg-accent text-white rounded px-2"
                title="Додати в профіль"
              >
                +
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(ch.id)}
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

      {/* ---------- modal ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-dark p-6 rounded w-80 space-y-3">
            <h3 className="text-xl font-bold mb-2">Новий акорд</h3>
            <input
              className="w-full p-2 border rounded"
              placeholder="Назва"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              placeholder="Струни (6 чисел, комою)"
              value={newStrings}
              onChange={(e) => setNewStrings(e.target.value)}
            />
            <textarea
              className="w-full p-2 border rounded"
              placeholder="Опис"
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            <input
              type="file"
              accept="audio/*"
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

