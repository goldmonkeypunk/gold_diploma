import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: false,
  headers: { "Content-Type": "application/json" }
});

export type Genre = "rock" | "pop" | "jazz" | "folk";

export interface SongDTO {
  id: number;
  title: string;
  lyrics: string;
  genre: Genre;
  sheet_url: string | null;
  audio_url: string | null;
  chord_ids: number[];
}

/* ────────────────   CRUD + фільтри   ──────────────── */

export interface SongFilter {
  search?: string;
  genre?: Genre;
  chord_id?: number;
}

export async function getSongs(params: SongFilter = {}) {
  const res = await api.get<SongDTO[]>("/songs", { params });
  return res.data;
}

export async function getSong(id: number) {
  const res = await api.get<SongDTO>(`/songs/${id}`);
  return res.data;
}

export async function createSong(payload: Omit<SongDTO, "id">) {
  const res = await api.post<SongDTO>("/songs", payload);
  return res.data;
}

export async function updateSong(
  id: number,
  payload: Partial<Omit<SongDTO, "id">>
) {
  const res = await api.patch<SongDTO>(`/songs/${id}`, payload);
  return res.data;
}

export async function deleteSong(id: number) {
  await api.delete(`/songs/${id}`);
}

/* ────────────────   збережене користувачем   ──────────────── */

/** Перелік збережених пісень поточного користувача */
export async function getSaved() {
  const res = await api.get<SongDTO[]>("/songs/me/saved");
  return res.data;
}

export async function saveSong(id: number) {
  await api.post(`/songs/${id}/save`);
}

export async function unsaveSong(id: number) {
  await api.delete(`/songs/${id}/save`);
}

export default api;
м
