import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { getSong, SongDTO } from "../../api/songs"

export default function SongDetailsPage() {
  const { songId } = useParams()
  const [song, setSong] = useState<SongDTO | null>(null)

  useEffect(() => {
    if (!songId) return
    getSong(Number(songId))
      .then(setSong)
      .catch(() => alert("Помилка завантаження"))
  }, [songId])

  if (!song) return <p className="p-4">Завантаження...</p>

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-3xl font-bold">{song.title}</h2>
      <p className="uppercase">{song.genre}</p>
      {song.sheet_url && (
        <img src={song.sheet_url} alt="Sheet" className="max-w-xl w-full rounded" />
      )}
      {song.audio_url && <audio controls src={song.audio_url} />}
      {song.lyrics && (
        <pre className="bg-light/5 p-4 rounded whitespace-pre-wrap">{song.lyrics}</pre>
      )}
      {song.chords && (
        <>
          <p className="font-semibold">Акорди:</p>
          <ul className="list-disc ml-4">
            {song.chords.map((c) => (
              <li key={c.id}>
                <Link to={`/chords/${c.id}`} className="text-accent hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
