import { useEffect, useState } from 'react'
import styles from './SplashScreen.module.css'

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
    <div className={`${styles.splashRoot} ${fading ? styles.fadeOut : ''}`}>
      <div className={styles.grainOverlay} />

      <div className={styles.beamMask} />
      <div className={styles.beamLight} />

      <div className={styles.wallGlow} />

      <div className={styles.logoWrap}>
        <h1 className={styles.title}>
          CINÉ<span className={styles.titleAccent}>CONNECT</span>
        </h1>

        <p className={styles.tagline}>
          Votre cinéma, vos amis
        </p>
      </div>
    </div>
  )
}
