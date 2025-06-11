import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import { AuthProvider } from "./context/AuthProvider"
import NavBar from "./components/NavBar"

import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ChordsPage from "./pages/Chords/ChordsPage"
import ChordDetailsPage from "./pages/Chords/ChordDetailsPage"
import SongsPage from "./pages/Songs/SongsPage"
import SongDetailsPage from "./pages/Songs/SongDetailsPage"
import ProfilePage from "./pages/ProfilePage"
import HomePage from "./pages/HomePage"            // если ещё нет — создайте файл по аналогии

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/chords" element={<ChordsPage />} />
          <Route path="/chords/:chordId" element={<ChordDetailsPage />} />

          <Route path="/songs" element={<SongsPage />} />
          <Route path="/songs/:songId" element={<SongDetailsPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="*"
            element={<div className="p-6 text-2xl text-red-600">404 Not Found</div>}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
