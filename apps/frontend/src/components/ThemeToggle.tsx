import { useThemeContext } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant de toggle pour changer le thème (clair/sombre)
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeContext()
  const isLight = resolvedTheme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
      title={isLight ? 'Mode sombre' : 'Mode clair'}
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card/92 px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-card ${className}`}
    >
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
          isLight ? 'bg-amber-100 text-amber-600' : 'bg-emerald-500/25 text-emerald-200'
        }`}
      >
        {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
      <span>{isLight ? 'Lune' : 'Soleil'}</span>
    </button>
  )
}

export default ThemeToggle;
