import { useEffect, useState } from 'react'

interface Props {
  onComplete: () => void
}

export function SplashScreen({ onComplete }: Props) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3200)
    const doneTimer = setTimeout(onComplete, 3900)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onComplete])

  return (
    <>
      <style>{`
        @keyframes flickerIn {
          0%   { opacity: 0; }
          5%   { opacity: 0.4; }
          6%   { opacity: 0.1; }
          10%  { opacity: 0.6; }
          11%  { opacity: 0.3; }
          15%  { opacity: 0.9; }
          16%  { opacity: 0.5; }
          20%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          88%  { opacity: 1; }
          89%  { opacity: 0.75; }
          90%  { opacity: 1; }
          95%  { opacity: 0.9; }
          96%  { opacity: 1; }
        }
        @keyframes beamAppear {
          0%   { opacity: 0; }
          30%  { opacity: 0.9; }
          100% { opacity: 0.85; }
        }
        @keyframes screenLight {
          0%   { opacity: 0; }
          25%  { opacity: 0; }
          50%  { opacity: 0.6; }
          70%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes logoProject {
          0%   { opacity: 0; filter: blur(8px); }
          40%  { opacity: 0; filter: blur(8px); }
          70%  { opacity: 1; filter: blur(1px); }
          85%  { opacity: 1; filter: blur(0px); }
          100% { opacity: 1; filter: blur(0px); }
        }
        @keyframes tagProject {
          0%   { opacity: 0; }
          70%  { opacity: 0; }
          100% { opacity: 0.55; }
        }
        @keyframes splashOut {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes grain {
          0%   { transform: translate(0, 0); }
          10%  { transform: translate(-2%, -3%); }
          20%  { transform: translate(-4%, 2%); }
          30%  { transform: translate(2%, -4%); }
          40%  { transform: translate(-1%, 3%); }
          50%  { transform: translate(3%, -1%); }
          60%  { transform: translate(-3%, 1%); }
          70%  { transform: translate(1%, 4%); }
          80%  { transform: translate(-2%, -2%); }
          90%  { transform: translate(4%, 1%); }
          100% { transform: translate(0, 0); }
        }
      `}</style>

      {/* Conteneur principal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'hsl(240, 18%, 3%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          animation: fading ? 'splashOut 0.7s ease forwards' : undefined,
        }}
      >
        {/* Grain de film — overlay */}
        <div
          style={{
            position: 'absolute',
            inset: '-50%',
            width: '200%',
            height: '200%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
            opacity: 0.6,
            animation: 'grain 0.15s steps(1) infinite',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        {/* Faisceau de projecteur — triangle depuis le haut */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '280px solid transparent',
            borderRight: '280px solid transparent',
            borderTop: '60vh solid transparent',
            background: 'none',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
        {/* Faisceau lumineux (gradient) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '560px',
            height: '62vh',
            background: 'linear-gradient(to bottom, hsla(265,78%,80%,0.22) 0%, hsla(265,78%,70%,0.08) 60%, transparent 100%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            animation: 'beamAppear 0.6s ease forwards',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Halo sur le "mur" — là où le faisceau arrive */}
        <div
          style={{
            position: 'absolute',
            width: '520px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, hsla(265,78%,62%,0.1) 0%, hsla(265,78%,62%,0.04) 50%, transparent 75%)',
            animation: 'screenLight 1.5s ease forwards',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Logo projeté */}
        <div
          style={{
            position: 'relative',
            textAlign: 'center',
            zIndex: 3,
            animation: 'flickerIn 0.8s ease forwards, flicker 5s 1.5s infinite',
          }}
        >
          <h1
            style={{
              fontSize: '4.5rem',
              fontFamily: "'Bebas Neue', system-ui, sans-serif",
              letterSpacing: '0.08em',
              margin: 0,
              color: '#fff',
              textShadow: `
                0 0 20px hsla(265,78%,80%,0.8),
                0 0 40px hsla(265,78%,62%,0.5),
                0 0 80px hsla(265,78%,62%,0.2)
              `,
              animation: 'logoProject 2s ease forwards',
            }}
          >
            CINÉ<span
              style={{
                color: 'hsl(38, 92%, 55%)',
                textShadow: `
                  0 0 20px hsla(38,92%,55%,0.8),
                  0 0 40px hsla(38,92%,55%,0.4)
                `,
              }}
            >CONNECT</span>
          </h1>

          <p
            style={{
              color: 'hsl(270, 8%, 70%)',
              fontSize: '0.72rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
              fontFamily: 'Inter, system-ui, sans-serif',
              animation: 'tagProject 3s ease forwards',
            }}
          >
            Votre cinéma, vos amis
          </p>
        </div>
      </div>
    </>
  )
}
