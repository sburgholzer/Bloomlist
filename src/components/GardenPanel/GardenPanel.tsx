import { useEffect, useRef, useState, useCallback } from 'react';
import { GardenPanelProps } from '../../types';
import { GardenGrid } from './GardenGrid';
import styles from './GardenPanel.module.css';

export function GardenPanel({ tasks, allComplete: _allComplete }: GardenPanelProps) {
  // _allComplete will be used by CelebrationOverlay (task 6.3)
  void _allComplete;
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const prevTasksRef = useRef<Map<string, boolean>>(new Map());

  // Track completion transitions to trigger animations
  useEffect(() => {
    const prevMap = prevTasksRef.current;
    const newAnimating = new Set<string>();

    for (const task of tasks) {
      const wasCompleted = prevMap.get(task.id);
      // Task just transitioned from incomplete to complete
      // wasCompleted === false means it was tracked and was incomplete
      // wasCompleted === undefined means it's new (just added or first render) — don't animate new additions
      if (wasCompleted === false && task.completed === true) {
        newAnimating.add(task.id);
      }
    }

    if (newAnimating.size > 0) {
      setAnimatingIds((prev) => {
        const next = new Set(prev);
        for (const id of newAnimating) {
          next.add(id);
        }
        return next;
      });
    }

    // Update the previous tasks map
    const nextMap = new Map<string, boolean>();
    for (const task of tasks) {
      nextMap.set(task.id, task.completed);
    }
    prevTasksRef.current = nextMap;
  }, [tasks]);

  const handleAnimationComplete = useCallback((taskId: string) => {
    setAnimatingIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  return (
    <section className={styles.panel} aria-label="Garden">
      <GardenGrid
        tasks={tasks}
        animatingIds={animatingIds}
        onAnimationComplete={handleAnimationComplete}
      />
    </section>
  );
}
