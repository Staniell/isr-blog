"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const THEMES = [
  { value: "light", label: "☀️ Light", icon: "☀️" },
  { value: "dark", label: "🌙 Dark", icon: "🌙" },
  { value: "purple", label: "💜 Purple", icon: "💜" },
  { value: "yellow", label: "🌻 Yellow", icon: "🌻" },
] as const;

type Theme = (typeof THEMES)[number]["value"];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && THEMES.some((t) => t.value === stored)) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-[130px] h-10 rounded-md animate-pulse" style={{ backgroundColor: "var(--bg-secondary)" }} />
    );
  }

  const currentTheme = THEMES.find((t) => t.value === theme);

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Select value={theme} onValueChange={handleChange}>
        <SelectTrigger
          className="w-[130px]"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--accent)",
          }}
        >
          <SelectValue>
            {currentTheme?.icon} {currentTheme?.value.charAt(0).toUpperCase()}
            {currentTheme?.value.slice(1)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--accent)",
          }}
        >
          {THEMES.map((t) => (
            <SelectItem key={t.value} value={t.value} style={{ color: "var(--text-primary)" }}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
}
