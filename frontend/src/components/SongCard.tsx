import React from "react";
import { Link } from "react-router-dom";
import { SongDTO } from "../api/songs";

export interface SongCardProps {
  song: SongDTO;
  saved?: boolean;
  onToggleSave?: (id: number, next: boolean) => void;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  saved = false,
  onToggleSave
}) => {
  const handleSave = () => {
    onToggleSave?.(song.id, !saved);
  };

  return (
    <div className="border rounded p-3 flex flex-col gap-2">
      <Link
        to={`/songs/${song.id}`}
        className="text-lg font-semibold hover:underline"
      >
        {song.title}
      </Link>

      <p className="text-sm text-gray-600">{song.genre}</p>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700"
      >
        {saved ? "★" : "☆"}
      </button>
    </div>
  );
};

export default SongCard;
