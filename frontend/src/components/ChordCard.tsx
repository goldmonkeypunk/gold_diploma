
import React from "react"
import { Link } from "react-router-dom"
import { ChordDTO } from "../api/chords"

export default function ChordCard({ id, name, strings, image_url }: ChordDTO) {
  return (
    <Link
      to={`/chords/${id}`}
      className="group bg-light/5 rounded-xl p-4 hover:bg-light/10 transition block"
    >
      {image_url && (
        <img
          src={image_url}
          alt={name}
          className="h-32 w-full object-contain mb-2 rounded"
        />
      )}
      <p className="text-xl font-bold mb-1 group-hover:text-accent">{name}</p>
      <p className="text-sm opacity-70">{strings.join("-")}</p>
    </Link>
  )
}
