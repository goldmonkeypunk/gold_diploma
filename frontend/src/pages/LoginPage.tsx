import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(username, password);
      navigate("/profile");
    } catch (err) {
      setError("Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">{t("login")}</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 w-64 text-sm"
      >
        <input
          className="border rounded p-2"
          type="text"
          placeholder={t("username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="border rounded p-2"
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? t("loading") : t("login")}
        </button>
      </form>
    </section>
  );
};

export default LoginPage;
