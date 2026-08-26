"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  function toggleTheme() {
    const current = document.documentElement.dataset.theme;
    const systemDark = !current && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = current === "dark" || systemDark ? "light" : "dark";
    setDark(next === "dark");
    window.localStorage.setItem("slotly-theme", next);
    document.documentElement.dataset.theme = next;
  }
  return <button type="button" onClick={toggleTheme} aria-label="Переключить тему" title="Переключить тему" className="focus-ring theme-toggle"><span aria-hidden>{dark ? "☼" : "☾"}</span></button>;
}
