import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { listChords, ChordDTO } from "../../api/chords";
import ChordCard from "../../components/ChordCard";

const ChordsPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [chords, setChords] = useState<ChordDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listChords({ search });
        setChords(data);
      } catch {
        setError("Load error");
      } finally {
        setLoading(false);
      }
    })();
  }, [search]);

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("chords")}</h1>

      <input
        type="text"
        className="border rounded p-2 w-64"
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p>{t("loading")}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chords.map((c) => (
          <ChordCard key={c.id} id={c.id} name={c.name} strings={c.strings} />
        ))}
      </div>
    </section>
  );
};

export default ChordsPage;
