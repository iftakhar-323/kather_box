import { useEffect, useState } from "react";
import { ThemeStore } from "../utils/kb";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(ThemeStore.get());

  useEffect(() => {
    ThemeStore.apply(theme);
    // Mark the html so transitions kick in *after* first paint
    requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-ready");
    });
  }, [theme]);

  const setLight = () => {
    setTheme("light");
    ThemeStore.set("light");
  };
  const setDark = () => {
    setTheme("dark");
    ThemeStore.set("dark");
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      <button
        className={"seg" + (theme === "light" ? " is-on" : "")}
        onClick={setLight}
        title="Light theme"
        aria-pressed={theme === "light"}
      >
        ☀
      </button>
      <button
        className={"seg" + (theme === "dark" ? " is-on" : "")}
        onClick={setDark}
        title="Dark theme"
        aria-pressed={theme === "dark"}
      >
        🌙
      </button>
    </div>
  );
}
