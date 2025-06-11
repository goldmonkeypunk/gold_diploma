import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

export interface SongDTO {
  id: number
  title: string
  genre?: string
  lyrics?: string
  sheet_url?: string
  audio_url?: string
  chords?: { id: number; name: string }[]
}

export async function getSongs(params: {
  search?: string
  genre?: string
  chord_id?: number
}) {
  const { data } = await api.get<SongDTO[]>("/songs", { params })
  return data
}

export async function getSong(id: number) {
  const { data } = await api.get<SongDTO>(`/songs/${id}`)
  return data
}

export async function createSong(form: FormData) {
  const { data } = await api.post("/songs", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function deleteSong(id: number) {
  return api.delete(`/songs/${id}`)
}

export async function saveSong(id: number) {
  return api.post(`/songs/${id}/save`)
}

export async function unsaveSong(id: number) {
  return api.delete(`/songs/${id}/save`)
}

export async function getSaved() {
  const { data } = await api.get<SongDTO[]>("/songs/me/saved")
  return data
}

