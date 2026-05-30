"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function usePrefersDark() {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {}
      const media = window.matchMedia("(prefers-color-scheme: dark)")
      media.addEventListener("change", onStoreChange)
      return () => media.removeEventListener("change", onStoreChange)
    },
    () => {
      if (typeof window === "undefined") return false
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    },
    () => false
  )
}

function applyResolvedTheme(resolvedTheme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolvedTheme === "dark")
  root.style.colorScheme = resolvedTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = usePrefersDark()
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    const stored = window.localStorage.getItem("theme")
    return isTheme(stored) ? stored : "system"
  })

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme

  React.useEffect(() => {
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("theme", theme)
  }, [theme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => setThemeState(nextTheme),
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: "system" as const,
      resolvedTheme: "light" as const,
      setTheme: () => {},
    }
  }
  return ctx
}
