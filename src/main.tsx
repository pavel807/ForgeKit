import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter";
import "./index.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/ui.css";
import "./styles/app.css";
import { initTheme } from "./core/theme";
import { Shell } from "./components/layout/Shell";

initTheme();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Shell />
  </React.StrictMode>,
);