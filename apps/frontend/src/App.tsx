import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { CinemaIntro } from "@/components/CinemaIntro";
import { useState, useCallback } from "react";
import Index from "./pages/Index";
import Films from "./pages/Films";
import FilmsByCategory from "./pages/FilmsByCategory";
import FilmDetail from "./pages/FilmDetail";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import Discussion from "./pages/Discussion";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/films" element={<Films />} />
        <Route path="/films/:categorie" element={<FilmsByCategory />} />
        <Route path="/film/:id" element={<FilmDetail />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/amis" element={<Friends />} />
        <Route path="/chat/:friendId" element={<Chat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => {
  const [introComplete, setIntroComplete] = useState(
    !!sessionStorage.getItem("cinema-intro-shown")
  );

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          {!introComplete && <CinemaIntro onComplete={handleIntroComplete} />}
          <BrowserRouter>
            <div className="dark min-h-screen bg-background text-foreground">
              <Navbar />
              <main className="pt-16">
                <AnimatedRoutes />
              </main>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
