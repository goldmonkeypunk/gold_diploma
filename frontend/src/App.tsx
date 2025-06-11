import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import NavBar from "./components/NavBar";
import ChordsPage from "./pages/Chords/ChordsPage";
import ChordDetailsPage from "./pages/Chords/ChordDetailsPage";
import SongsPage from "./pages/Songs/SongsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

const App: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/chords" replace />} />

          <Route path="/chords" element={<ChordsPage />} />
          <Route path="/chords/:id" element={<ChordDetailsPage />} />

          <Route path="/songs" element={<SongsPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* fallback 404 */}
          <Route
            path="*"
            element={
              <p className="text-center text-lg text-red-600">
                {t("no_results")}
              </p>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
