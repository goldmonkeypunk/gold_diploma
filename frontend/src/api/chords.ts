import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

export interface ChordDTO {
  id: number
  name: string
  strings: number[]
  description?: string
  image_url?: string
  audio_url?: string
}

export async function getChords(search = "") {
  const { data } = await api.get<ChordDTO[]>("/chords", {
    params: search ? { search } : undefined,
  })
  return data
}

export async function createChord(form: FormData) {
  const { data } = await api.post("/chords", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}

export async function deleteChord(id: number) {
  return api.delete(`/chords/${id}`)
}

export async function saveChord(id: number) {
  return api.post(`/chords/${id}/save`)
}

export async function unsaveChord(id: number) {
  return api.delete(`/chords/${id}/save`)
}

export async function getSavedChords() {
  const { data } = await api.get<ChordDTO[]>("/chords/me/saved")
  return data
}
