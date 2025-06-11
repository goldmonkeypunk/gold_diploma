import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

async function bootstrap() {
  try {
    const [{ default: i18n }, { initReactI18next }] = await Promise.all([
      import("i18next"),
      import("react-i18next")
    ]);

    const uk = (await import("./locales/uk.json")).default;

    await i18n.use(initReactI18next).init({
      resources: { uk: { translation: uk } },
      lng: "uk",
      fallbackLng: "uk",
      interpolation: { escapeValue: false }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("i18n not initialised:", e);
  }

  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <Suspense fallback={<p>Loading…</p>}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Suspense>
    </React.StrictMode>
  );
}

bootstrap();
