import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" }
});

export interface ChordDTO {
  id: number;
  name: string;
  strings: number[];          // шість значень: -1 або 0-24
  description: string | null;
  image_url: string | null;
  audio_url: string | null;
}

/* ──────────────── Список та деталі ──────────────── */

export interface ChordFilter {
  search?: string;
}

/** Отримати список акордів (з фільтром пошуку) */
export async function listChords(params: ChordFilter = {}) {
  const res = await api.get<ChordDTO[]>("/chords", { params });
  return res.data;
}

/** Отримати один акорд за ID */
export async function getChord(id: number) {
  const res = await api.get<ChordDTO>(`/chords/${id}`);
  return res.data;
}

/* ──────────────── CRUD (ADMIN) ──────────────── */

export async function createChord(payload: Omit<ChordDTO, "id">) {
  const res = await api.post<ChordDTO>("/chords", payload);
  return res.data;
}

export async function updateChord(
  id: number,
  payload: Partial<Omit<ChordDTO, "id">>
) {
  const res = await api.patch<ChordDTO>(`/chords/${id}`, payload);
  return res.data;
}

export async function deleteChord(id: number) {
  await api.delete(`/chords/${id}`);
}

/* ──────────────── Збережені акорди користувача ──────────────── */

export async function getSavedChords() {
  const res = await api.get<ChordDTO[]>("/chords/me/saved");
  return res.data;
}

export async function saveChord(id: number) {
  await api.post(`/chords/${id}/save`);
}

export async function unsaveChord(id: number) {
  await api.delete(`/chords/${id}/save`);
}

export default api;
