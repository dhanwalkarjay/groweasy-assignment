"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={() => setDark((value) => !value)}
      className="focus-ring grid h-10 w-10 place-items-center rounded-md border border-zinc-300 bg-white text-ink shadow-sm transition hover:border-leaf dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
