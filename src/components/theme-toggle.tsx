"use client";

import { useState } from "react";

type Theme = "light" | "dark" | "system";

const labels: Record<Theme, string> = { light: "Светлая тема", dark: "Тёмная тема", system: "Системная тема" };
const nextTheme: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  function toggleTheme() {
    const current = document.documentElement.dataset.theme;
    const value = nextTheme[current === "light" || current === "dark" || current === "system" ? current : theme];
    setTheme(value);
    window.localStorage.setItem("slotly-theme", value);
    document.documentElement.dataset.theme = value;
  }

  const icon = theme === "dark" ? "Т" : theme === "light" ? "С" : "А";
  return <button type="button" onClick={toggleTheme} aria-label={labels[theme]} title={`${labels[theme]}. Нажмите, чтобы сменить`} className="focus-ring theme-toggle"><span aria-hidden>{icon}</span><span className="sr-only">{labels[theme]}</span></button>;
}
