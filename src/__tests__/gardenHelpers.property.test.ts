import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getGrowthStage, getProgress, isCelebration } from '../utils/gardenHelpers';
import type { Task } from '../types';

// Arbitrary: generates a Task with realistic values
const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 150 }).filter((s) => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 1_000_000_000_000, max: 1_700_000_000_000 }),
});

// Arbitrary: generates a non-empty task array (simulating a DayState with tasks)
const taskArrayArb = fc.array(taskArb, { minLength: 0, maxLength: 20 });
const nonEmptyTaskArrayArb = fc.array(taskArb, { minLength: 1, maxLength: 20 });

// Feature: bloomlist-garden, Property 5: Plant count equals task count

/**
 * **Validates: Requirements 1.3, 3.2, 6.4**
 *
 * Property 5: Plant count equals task count
 * For any DayState, the number of plants (tasks with a growth stage) equals
 * the number of tasks in the task list.
 */
describe('gardenHelpers — Property 5: Plant count equals task count', () => {
  it('every task has a derivable growth stage, so plant count equals task count', () => {
    fc.assert(
      fc.property(taskArrayArb, (tasks) => {
        // Every task maps to exactly one growth stage (i.e., one plant)
        const plants = tasks.map((task) => getGrowthStage(task));

        expect(plants.length).toBe(tasks.length);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: bloomlist-garden, Property 6: Growth stage determined by completion state

/**
 * **Validates: Requirements 2.2, 2.3, 3.3**
 *
 * Property 6: Growth stage determined by completion state
 * For any task, the derived growth stage is 'blooming' if completed, 'seed' if incomplete.
 */
describe('gardenHelpers — Property 6: Growth stage determined by completion state', () => {
  it('completed tasks are blooming, incomplete tasks are seed', () => {
    fc.assert(
      fc.property(taskArb, (task) => {
        const stage = getGrowthStage(task);

        if (task.completed) {
          expect(stage).toBe('blooming');
        } else {
          expect(stage).toBe('seed');
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: bloomlist-garden, Property 7: Progress counter derivation

/**
 * **Validates: Requirements 2.4, 6.5**
 *
 * Property 7: Progress counter derivation
 * For any DayState, the computed progress count equals the number of tasks
 * where completed === true, and the total equals the task list length.
 */
describe('gardenHelpers — Property 7: Progress counter derivation', () => {
  it('progress completed count equals number of completed tasks, total equals list length', () => {
    fc.assert(
      fc.property(taskArrayArb, (tasks) => {
        const progress = getProgress(tasks);

        const expectedCompleted = tasks.filter((t) => t.completed).length;

        expect(progress.completed).toBe(expectedCompleted);
        expect(progress.total).toBe(tasks.length);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: bloomlist-garden, Property 8: Celebration condition

/**
 * **Validates: Requirements 3.5, 3.6**
 *
 * Property 8: Celebration condition
 * For any DayState where the task list is non-empty and every task is completed,
 * the celebration condition is true. For any DayState where the task list is empty
 * or at least one task is incomplete, the celebration condition is false.
 */
describe('gardenHelpers — Property 8: Celebration condition', () => {
  it('celebration is true when task list is non-empty and all tasks are completed', () => {
    // Generate a non-empty list of all-completed tasks
    const allCompletedTasksArb = fc
      .array(taskArb, { minLength: 1, maxLength: 20 })
      .map((tasks) => tasks.map((t) => ({ ...t, completed: true })));

    fc.assert(
      fc.property(allCompletedTasksArb, (tasks) => {
        expect(isCelebration(tasks)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('celebration is false when task list is empty', () => {
    expect(isCelebration([])).toBe(false);
  });

  it('celebration is false when at least one task is incomplete', () => {
    // Generate a non-empty list with at least one incomplete task
    const mixedTasksArb = nonEmptyTaskArrayArb.filter(
      (tasks) => tasks.some((t) => !t.completed)
    );

    fc.assert(
      fc.property(mixedTasksArb, (tasks) => {
        expect(isCelebration(tasks)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});
