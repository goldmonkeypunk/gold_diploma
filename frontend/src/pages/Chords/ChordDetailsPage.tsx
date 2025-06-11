import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { ChordDTO } from "../../api/chords"
import axios from "axios"

export default function ChordDetailsPage() {
  const { chordId } = useParams()
  const [chord, setChord] = useState<ChordDTO | null>(null)

  useEffect(() => {
    async function fetchOne() {
      try {
        const { data } = await axios.get<ChordDTO>(
          `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/chords/${chordId}`
        )
        setChord(data)
      } catch {
        alert("Помилка завантаження")
      }
    }
    fetchOne()
  }, [chordId])

  if (!chord) return <p className="p-4">Завантаження...</p>

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">{chord.name}</h2>

      {chord.image_url && (
        <img
          src={chord.image_url}
          alt={chord.name}
          className="w-64 h-64 object-contain mb-4"
        />
      )}

      {chord.audio_url && (
        <audio controls src={chord.audio_url} className="mb-4" />
      )}

      <p className="mb-2 font-semibold">Струни:</p>
      <p>{chord.strings.join(" - ")}</p>

      {chord.description && (
        <>
          <p className="mt-4 font-semibold">Опис:</p>
          <p>{chord.description}</p>
        </>
      )}
    </div>
  )
}

