import { useThemeContext } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant de toggle pour changer le thème (clair/sombre)
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useThemeContext()
  const isLight = resolvedTheme === 'light'

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-border bg-card/90 p-1 shadow-sm backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Sélecteur de thème"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={isLight}
        className={`min-w-[86px] px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
          isLight
            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/10'
            : 'text-foreground/80 hover:text-foreground hover:bg-background/60'
        }`}
      >
        White
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={!isLight}
        className={`min-w-[86px] px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
          !isLight
            ? 'bg-slate-900 text-slate-100 shadow-sm ring-1 ring-white/15'
            : 'text-foreground/80 hover:text-foreground hover:bg-background/60'
        }`}
      >
        Dark
      </button>
    </div>
  )
}

export default ThemeToggle;
