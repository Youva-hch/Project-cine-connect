import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/contexts'
import { Navbar } from '@/components/Navbar'
import { CinemaIntro } from '@/components/CinemaIntro'
import { useState, useCallback } from 'react'
import NotFound from '@/pages/NotFound'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const [introComplete, setIntroComplete] = useState(
    !!sessionStorage.getItem('cinema-intro-shown'),
  )

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            {!introComplete && <CinemaIntro onComplete={handleIntroComplete} />}
            <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
              <Navbar />
              <main className="pt-16">
                <Outlet />
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
