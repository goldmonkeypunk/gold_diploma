import React from "react";
import { Link } from "react-router-dom";

export interface ChordCardProps {
  id: number;
  name: string;
  strings: number[];          // [-1, 0-24] – саме шість значень
  saved?: boolean;
  onToggleSave?: (id: number, next: boolean) => void;
}

const ChordCard: React.FC<ChordCardProps> = ({
  id,
  name,
  strings,
  saved = false,
  onToggleSave
}) => {
  const handleSave = () => {
    onToggleSave?.(id, !saved);
  };

  return (
    <div className="border rounded p-3 flex flex-col gap-2">
      <Link
        to={`/chords/${id}`}
        className="text-lg font-semibold hover:underline"
      >
        {name}
      </Link>

      {/* Тимчасова текстова візуалізація струн */}
      <pre className="text-sm bg-gray-100 p-2 rounded">
        {JSON.stringify(strings)}
      </pre>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700"
      >
        {saved ? "★" : "☆"}
      </button>
    </div>
  );
};

export default ChordCard;
