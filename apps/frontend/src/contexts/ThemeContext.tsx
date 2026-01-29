import { createContext, useContext, type ReactNode } from 'react'
import { useTheme } from '../hooks/useTheme'
import type { Theme } from '../hooks/useTheme'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

/**
 * Provider pour le contexte du thème
 * Wrap votre application avec ce provider pour accéder au thème partout
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValues = useTheme()

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook pour utiliser le contexte du thème
 * Doit être utilisé dans un composant enfant de ThemeProvider
 */
export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider
