import { useEffect, useRef, useState, useCallback } from 'react';
import { PlantProps, GrowthStage } from '../../types';
import styles from './Plant.module.css';

const GROWTH_STAGES: GrowthStage[] = ['seed', 'sprout', 'budding', 'blooming'];
const STAGE_DURATION_MS = 375; // ~1.5s total / 4 stages

export function Plant({ growthStage, isAnimating, onAnimationComplete }: PlantProps) {
  const [displayStage, setDisplayStage] = useState<GrowthStage>(growthStage);
  const [isInAnimation, setIsInAnimation] = useState(false);
  const [showStageEnter, setShowStageEnter] = useState(false);
  const timerRef = useRef<number | null>(null);
  const stageIndexRef = useRef(0);
  const isCancellingRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceStage = useCallback(() => {
    stageIndexRef.current += 1;

    if (stageIndexRef.current >= GROWTH_STAGES.length) {
      // Animation complete
      setIsInAnimation(false);
      setShowStageEnter(false);
      onAnimationComplete();
      return;
    }

    setDisplayStage(GROWTH_STAGES[stageIndexRef.current]);
    setShowStageEnter(true);

    timerRef.current = window.setTimeout(() => {
      advanceStage();
    }, STAGE_DURATION_MS);
  }, [onAnimationComplete]);

  // Start animation when isAnimating becomes true
  useEffect(() => {
    if (isAnimating && !isInAnimation) {
      isCancellingRef.current = false;
      setIsInAnimation(true);
      stageIndexRef.current = 0;
      setDisplayStage(GROWTH_STAGES[0]);
      setShowStageEnter(true);

      timerRef.current = window.setTimeout(() => {
        advanceStage();
      }, STAGE_DURATION_MS);
    }
  }, [isAnimating, isInAnimation, advanceStage]);

  // Handle cancellation: if isAnimating becomes false while we're animating
  useEffect(() => {
    if (!isAnimating && isInAnimation) {
      isCancellingRef.current = true;
      clearTimer();
      setIsInAnimation(false);
      setShowStageEnter(false);
      // Jump to final target state within 150ms
      setDisplayStage(growthStage);
      onAnimationComplete();
    }
  }, [isAnimating, isInAnimation, growthStage, clearTimer, onAnimationComplete]);

  // When not animating, sync display stage with prop (immediate revert to seed)
  useEffect(() => {
    if (!isAnimating && !isInAnimation) {
      setDisplayStage(growthStage);
      setShowStageEnter(false);
    }
  }, [growthStage, isAnimating, isInAnimation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const containerClasses = [
    styles.plantContainer,
    isInAnimation ? styles.animating : '',
    isCancellingRef.current ? styles.cancelTransition : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} aria-label={`Plant stage: ${displayStage}`}>
      {renderStage(displayStage, showStageEnter)}
    </div>
  );
}

function renderStage(stage: GrowthStage, animate: boolean): JSX.Element {
  const enterClass = animate ? styles.stageEnter : '';

  switch (stage) {
    case 'seed':
      return <div className={`${styles.seed} ${enterClass}`} />;

    case 'sprout':
      return (
        <div className={`${styles.sprout} ${enterClass}`}>
          <div className={styles.sproutLeaf} />
          <div className={styles.sproutStem} />
        </div>
      );

    case 'budding':
      return (
        <div className={`${styles.budding} ${enterClass}`}>
          <div className={styles.buddingBud} />
          <div className={styles.buddingStem} />
          <div className={styles.buddingLeafLeft} />
          <div className={styles.buddingLeafRight} />
        </div>
      );

    case 'blooming':
      return (
        <div className={`${styles.blooming} ${enterClass}`}>
          <div className={styles.bloomingFlower}>
            <div className={styles.bloomingPetal} />
            <div className={styles.bloomingPetal} />
            <div className={styles.bloomingPetal} />
            <div className={styles.bloomingPetal} />
            <div className={styles.bloomingPetal} />
            <div className={styles.bloomingPetal} />
            <div className={styles.bloomingCenter} />
          </div>
          <div className={styles.bloomingStem} />
          <div className={styles.bloomingLeafLeft} />
          <div className={styles.bloomingLeafRight} />
        </div>
      );
  }
}
