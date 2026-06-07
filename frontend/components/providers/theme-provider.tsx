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
const THEME_STORAGE_KEY = "theme"
const THEME_CHANGE_EVENT = "nxt-theme-change"

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

function subscribeToTheme(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onStoreChange()
  }

  window.addEventListener("storage", handleStorage)
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange)

  return () => {
    window.removeEventListener("storage", handleStorage)
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange)
  }
}

function getThemeSnapshot(): Theme {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(stored) ? stored : "system"
}

function getThemeServerSnapshot(): Theme {
  return "system"
}

export function setAppTheme(nextTheme: Theme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const resolvedTheme =
    nextTheme === "system" ? (prefersDark ? "dark" : "light") : nextTheme
  applyResolvedTheme(resolvedTheme)
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const prefersDark = usePrefersDark()
  const theme = React.useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  )

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (prefersDark ? "dark" : "light") : theme

  React.useEffect(() => {
    applyResolvedTheme(resolvedTheme)
  }, [resolvedTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setAppTheme,
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
