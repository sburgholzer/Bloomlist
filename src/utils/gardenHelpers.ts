import { GrowthStage, Task } from '../types';

/**
 * Returns the growth stage for a task's corresponding plant.
 * Completed tasks are 'blooming', incomplete tasks are 'seed'.
 */
export function getGrowthStage(task: Task): GrowthStage {
  return task.completed ? 'blooming' : 'seed';
}

/**
 * Returns the progress count of completed tasks vs total tasks.
 */
export function getProgress(tasks: Task[]): { completed: number; total: number } {
  return {
    completed: tasks.filter((t) => t.completed).length,
    total: tasks.length,
  };
}

/**
 * Returns true when all tasks are completed and the list is non-empty.
 * This is the trigger condition for the celebration overlay.
 */
export function isCelebration(tasks: Task[]): boolean {
  return tasks.length > 0 && tasks.every((t) => t.completed);
}
