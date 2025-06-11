import React from "react"
import { Link } from "react-router-dom"
import { SongDTO } from "../api/songs"

export default function SongCard({ id, title, genre }: SongDTO) {
  return (
    <Link
      to={`/songs/${id}`}
      className="group bg-light/5 rounded-xl p-4 hover:bg-light/10 transition block"
    >
      <p className="text-xl font-bold mb-1 group-hover:text-accent">{title}</p>
      {genre && <p className="text-sm opacity-70 uppercase">{genre}</p>}
    </Link>
  )
}

