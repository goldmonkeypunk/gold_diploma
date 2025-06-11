import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NavBar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className="flex gap-4 p-4 bg-gray-200">
      <Link to="/chords">{t("chords")}</Link>
      <Link to="/songs">{t("songs")}</Link>
      <Link to="/profile">{t("profile")}</Link>
    </nav>
  );
};

export default NavBar;
