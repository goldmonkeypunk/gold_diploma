import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import { ChordDTO } from "../../api/chords";

const ChordDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [chord, setChord]   = useState<ChordDTO | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoad ] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const { data } = await axios.get<ChordDTO>(`/api/chords/${id}`);
        setChord(data);
      } catch {
        setError(t("error_load_chord"));
      } finally {
        setLoad(false);
      }
    })();
  }, [id, t]);

  if (loading) return <p>{t("loading")}</p>;
  if (error)   return <p className="text-red-600">{error}</p>;
  if (!chord)  return null;

  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold mb-4">{chord.name}</h1>

      {/* тимчасова JSON-візуалізація даних акорда */}
      <pre className="bg-gray-100 p-2 rounded">
        {JSON.stringify(chord, null, 2)}
      </pre>
    </section>
  );
};

export default ChordDetailsPage;
