import { Task } from '../../types';
import { GrowthStage } from '../../types';
import { getGrowthStage } from '../../utils/gardenHelpers';
import { Plant } from '../Plant/Plant';
import styles from './GardenGrid.module.css';

interface GardenGridProps {
  tasks: Task[];
  animatingIds: Set<string>;
  onAnimationComplete: (taskId: string) => void;
}

export function GardenGrid({ tasks, animatingIds, onAnimationComplete }: GardenGridProps) {
  if (tasks.length === 0) {
    return (
      <p className={styles.emptyGarden}>
        Your garden is empty. Add tasks to plant seeds!
      </p>
    );
  }

  return (
    <div className={styles.grid}>
      {tasks.map((task) => {
        const growthStage: GrowthStage = getGrowthStage(task);
        const isAnimating = animatingIds.has(task.id);

        return (
          <div key={task.id} className={styles.cell}>
            <Plant
              growthStage={growthStage}
              isAnimating={isAnimating}
              onAnimationComplete={() => onAnimationComplete(task.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
