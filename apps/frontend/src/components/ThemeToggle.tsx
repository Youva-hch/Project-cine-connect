import { useThemeContext } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant de toggle pour changer le thème (clair/sombre)
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useThemeContext()

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 text-xl rounded-lg bg-secondary hover:bg-accent transition-colors duration-200 ${className}`}
      aria-label={resolvedTheme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
