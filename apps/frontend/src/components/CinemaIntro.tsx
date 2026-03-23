import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CinemaIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"countdown" | "projector" | "reveal">(
    "countdown"
  );
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (sessionStorage.getItem("cinema-intro-shown")) {
      onComplete();
      return;
    }

    const countdownTimer = window.setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          window.clearInterval(countdownTimer);
          setPhase("projector");
          window.setTimeout(() => setPhase("reveal"), 1200);
          window.setTimeout(() => {
            sessionStorage.setItem("cinema-intro-shown", "true");
            onComplete();
          }, 2400);
          return 0;
        }
        return c - 1;
      });
    }, 600);

    return () => window.clearInterval(countdownTimer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "hsl(var(--cinema-dark))" }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Film grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
            animation: "grain 0.5s steps(4) infinite",
          }}
        />

        {/* Projector light cone */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "40vw solid transparent",
            borderRight: "40vw solid transparent",
            borderTop:
              "100vh solid hsla(var(--cinema-gold) / 0.04)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {phase === "countdown" && (
          <motion.div className="relative z-10 flex flex-col items-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--cinema-gold) / 0.2)"
                  strokeWidth="2"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--cinema-gold))"
                  strokeWidth="2"
                  strokeDasharray="283"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 283 }}
                  transition={{ duration: 1.8, ease: "linear" }}
                />
              </svg>
              <motion.span
                key={count}
                className="absolute inset-0 flex items-center justify-center font-display text-6xl md:text-7xl"
                style={{ color: "hsl(var(--cinema-gold))" }}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {count}
              </motion.span>
            </div>
            <div className="flex gap-2 mt-8">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-6 rounded-full"
                  style={{
                    backgroundColor: "hsl(var(--cinema-gold) / 0.3)",
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "projector" && (
          <motion.div className="relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, hsl(var(--cinema-gold)) 0%, hsl(var(--cinema-gold) / 0.3) 40%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.5, 1.2, 2, 40],
                opacity: [0.8, 1, 0.6, 1, 1],
              }}
              transition={{
                duration: 1.2,
                times: [0, 0.2, 0.4, 0.6, 1],
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}

        {phase === "reveal" && (
          <>
            <motion.div
              className="absolute inset-y-0 left-0 w-1/2 z-20"
              style={{ backgroundColor: "hsl(var(--cinema-dark))" }}
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{
                duration: 1,
                ease: [0.76, 0, 0.24, 1],
              }}
            />
            <motion.div
              className="absolute inset-y-0 right-0 w-1/2 z-20"
              style={{ backgroundColor: "hsl(var(--cinema-dark))" }}
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1,
                ease: [0.76, 0, 0.24, 1],
              }}
            />
            <motion.div
              className="relative z-10 text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 className="font-display text-6xl md:text-8xl tracking-wider text-gradient-cinema">
                CinéConnect
              </h1>
            </motion.div>
          </>
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, hsl(var(--cinema-dark)) 100%)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

