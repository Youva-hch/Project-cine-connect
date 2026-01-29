import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'cine-connect-theme'

/**
 * Hook pour gérer le thème de l'application
 * Supporte les modes: light et dark (dark par défaut)
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'dark'
  })

  const [resolvedTheme, setResolvedTheme] = useState<Theme>('dark')

  // Appliquer le thème au document
  const applyTheme = useCallback((themeValue: Theme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(themeValue)
    setResolvedTheme(themeValue)
  }, [])

  // Changer le thème
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    applyTheme(newTheme)
  }, [applyTheme])

  // Toggle entre light et dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [resolvedTheme, setTheme])

  // Initialiser le thème au montage
  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  return {
    theme,           // Thème sélectionné (light, dark, system)
    resolvedTheme,   // Thème effectif (light ou dark)
    setTheme,        // Changer le thème
    toggleTheme,     // Basculer entre light et dark
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  }
}

export default useTheme
