import { useEffect, useState, useMemo } from 'react';
import styles from './CelebrationOverlay.module.css';

interface CelebrationOverlayProps {
  active: boolean;
}

interface Particle {
  id: number;
  left: string;
  size: number;
  color: string;
  delay: string;
}

const COLORS = [
  '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0',
  '#ff9f43', '#ee5253', '#10ac84', '#2e86de',
];

const PARTICLE_COUNT = 30;
const CELEBRATION_DURATION = 3000; // 3 seconds

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 6 + Math.random() * 8,
    color: COLORS[i % COLORS.length],
    delay: `${Math.random() * 0.8}s`,
  }));
}

export function CelebrationOverlay({ active }: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);

  const particles = useMemo(() => generateParticles(), [visible]);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, CELEBRATION_DURATION);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [active]);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.overlay} aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.particle}
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

export default CelebrationOverlay;
