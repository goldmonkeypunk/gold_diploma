import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthContext } from "../context/AuthProvider"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const { register } = useAuthContext()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await register(username, password)
      navigate("/")
    } catch {
      alert("Помилка реєстрації")
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Реєстрація</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border rounded"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Зареєструватися
        </button>
      </form>
    </div>
  )
}
