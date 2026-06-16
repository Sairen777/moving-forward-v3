import { createSignal, onMount } from "solid-js";

import styles from "./ThemeToggle.module.css";

function applyTheme(theme: "dark" | "light") {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#0a1018" : "#ffffff";
}

export function ThemeToggle() {
  const [theme, setTheme] = createSignal<"dark" | "light">("light");

  onMount(() => {
    // Read the already-resolved theme from the inline script.
    const current = document.documentElement.dataset.theme as "dark" | "light";
    setTheme(current === "dark" ? "dark" : "light");

    // Follow OS changes while no explicit preference is stored.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", () => {
      if (!localStorage.getItem("theme")) {
        const next = mq.matches ? "dark" : "light";
        setTheme(next);
        applyTheme(next);
      }
    });
  });

  const toggle = () => {
    const next = theme() === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <button
      class={styles.toggle}
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme() === "dark" ? "light" : "dark"} theme`}
      title={theme() === "dark" ? "day" : "night"}
    >
      [{theme() === "dark" ? "day" : "night"}]
    </button>
  );
}
