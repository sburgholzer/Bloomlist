import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { taskReducer, createEmptyDayState } from '../reducers/taskReducer';
import type { DayState, Task, TaskAction } from '../types';

// Feature: bloomlist-garden, Property 1: Valid task addition grows the list

/**
 * Validates: Requirements 1.1
 *
 * Property 1: Valid task addition grows the list
 * For any valid task title (non-empty, non-whitespace-only, 1-150 characters)
 * and any current DayState with fewer than 20 tasks, dispatching an ADD_TASK
 * action shall result in a new state where the task list length has increased
 * by exactly one and the new task's title equals the submitted title (trimmed).
 */

// Arbitrary: generates a valid task title (non-empty, non-whitespace-only, 1-150 chars after trim)
const validTaskTitle = fc
  .string({ minLength: 1, maxLength: 150 })
  .filter((s) => s.trim().length > 0 && s.trim().length <= 150);

// Arbitrary: generates a Task with realistic values
// Use timestamps in the past so that the new task (created with Date.now()) is always the newest
const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 150 }).filter((s) => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 1_000_000_000_000, max: 1_700_000_000_000 }),
});

// Arbitrary: generates a DayState with 0-19 tasks (fewer than 20)
const dayStateUnderLimit: fc.Arbitrary<DayState> = fc
  .record({
    date: fc.constantFrom('2024-01-01', '2024-06-15', '2025-03-20'),
    tasks: fc.array(taskArb, { minLength: 0, maxLength: 19 }),
  })
  .map((state) => ({
    ...state,
    tasks: state.tasks.sort((a, b) => a.createdAt - b.createdAt),
  }));

describe('taskReducer — Property 1: Valid task addition grows the list', () => {
  it('adding a valid task increases list length by exactly one and the new task title matches trimmed input', () => {
    fc.assert(
      fc.property(dayStateUnderLimit, validTaskTitle, (state, title) => {
        const previousLength = state.tasks.length;
        const existingIds = new Set(state.tasks.map((t) => t.id));

        const newState = taskReducer(state, { type: 'ADD_TASK', title });

        // List length increased by exactly one
        expect(newState.tasks.length).toBe(previousLength + 1);

        // Find the newly added task (the one with an ID not in the original set)
        const addedTask = newState.tasks.find((t) => !existingIds.has(t.id));
        expect(addedTask).toBeDefined();
        expect(addedTask!.title).toBe(title.trim());
      }),
      { numRuns: 100 }
    );
  });
});


// Feature: bloomlist-garden, Property 4: Maximum 20 tasks invariant

/**
 * **Validates: Requirements 1.6, 1.7**
 *
 * Property 4: Maximum 20 tasks invariant
 * For any sequence of actions applied to an initially empty DayState,
 * the task list length shall never exceed 20.
 */
describe('taskReducer — Property 4: Maximum 20 tasks invariant', () => {
  it('task list length never exceeds 20 regardless of how many ADD_TASK actions are dispatched', () => {
    // Generate a sequence of 30+ ADD_TASK actions with valid (non-empty) titles
    const addTaskAction = fc
      .string({ minLength: 1, maxLength: 150 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        fc.array(addTaskAction, { minLength: 25, maxLength: 50 }),
        (titles) => {
          let state = createEmptyDayState('2024-01-01');

          for (const title of titles) {
            state = taskReducer(state, { type: 'ADD_TASK', title });
            // Invariant: task list length must never exceed 20
            expect(state.tasks.length).toBeLessThanOrEqual(20);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});


// Feature: bloomlist-garden, Property 2: Whitespace-only titles are rejected

/**
 * **Validates: Requirements 1.4**
 *
 * Property 2: Whitespace-only titles are rejected
 * For any string composed entirely of whitespace characters (including the empty string),
 * dispatching an ADD_TASK action shall leave the DayState unchanged—same task list length,
 * same task contents.
 */
describe('taskReducer — Property 2: Whitespace-only titles are rejected', () => {
  it('should leave DayState unchanged when title is whitespace-only or empty', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        (whitespaceTitle: string) => {
          const initialState: DayState = createEmptyDayState('2024-01-15');

          const result = taskReducer(initialState, {
            type: 'ADD_TASK',
            title: whitespaceTitle,
          });

          // State should be completely unchanged
          expect(result.tasks.length).toBe(initialState.tasks.length);
          expect(result.tasks).toEqual(initialState.tasks);
          expect(result).toBe(initialState); // reference equality — no new object created
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should leave DayState unchanged when title is whitespace-only and tasks already exist', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
        (whitespaceTitle: string) => {
          // Start with a state that already has some tasks
          const stateWithTasks: DayState = {
            date: '2024-01-15',
            tasks: [
              { id: 'task-1', title: 'Existing task', completed: false, createdAt: 1000 },
              { id: 'task-2', title: 'Another task', completed: true, createdAt: 2000 },
            ],
          };

          const result = taskReducer(stateWithTasks, {
            type: 'ADD_TASK',
            title: whitespaceTitle,
          });

          // State should be completely unchanged
          expect(result.tasks.length).toBe(stateWithTasks.tasks.length);
          expect(result.tasks).toEqual(stateWithTasks.tasks);
          expect(result).toBe(stateWithTasks); // reference equality
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: bloomlist-garden, Property 3: Task list ordering invariant

/**
 * Validates: Requirements 1.2
 *
 * Property 3: Task list ordering invariant
 * For any DayState produced by any sequence of valid actions (ADD_TASK, TOGGLE_TASK, DELETE_TASK),
 * the tasks array shall be sorted in non-decreasing order by their createdAt timestamp.
 */
describe('taskReducer — Property 3: Task list ordering invariant', () => {
  it('tasks array is sorted by createdAt after any sequence of valid actions', () => {
    // Generate a sequence of mixed actions and apply them to build up state
    const actionSequenceArb = fc.gen().map((gen) => {
      let state: DayState = createEmptyDayState('2024-01-01');
      const actions: TaskAction[] = [];

      const numActions = gen(fc.integer, { min: 1, max: 30 });

      for (let i = 0; i < numActions; i++) {
        const taskIds = state.tasks.map((t) => t.id);
        const hasExistingTasks = taskIds.length > 0;

        // Weight ADD_TASK more heavily to build up state
        const actionType = hasExistingTasks
          ? gen(fc.constantFrom, 'ADD_TASK', 'ADD_TASK', 'TOGGLE_TASK', 'DELETE_TASK')
          : 'ADD_TASK';

        let action: TaskAction;

        switch (actionType) {
          case 'ADD_TASK': {
            // Generate a valid non-whitespace title
            const title = gen(fc.string, { minLength: 1, maxLength: 50 }).replace(
              /^\s*$/,
              'valid-title'
            );
            action = { type: 'ADD_TASK', title };
            break;
          }
          case 'TOGGLE_TASK': {
            const id = gen(fc.constantFrom, ...taskIds);
            action = { type: 'TOGGLE_TASK', id };
            break;
          }
          case 'DELETE_TASK': {
            const id = gen(fc.constantFrom, ...taskIds);
            action = { type: 'DELETE_TASK', id };
            break;
          }
          default:
            action = { type: 'ADD_TASK', title: 'fallback' };
        }

        actions.push(action);
        state = taskReducer(state, action);
      }

      return state;
    });

    fc.assert(
      fc.property(actionSequenceArb, (finalState) => {
        const { tasks } = finalState;

        // Assert non-decreasing order by createdAt
        for (let i = 0; i < tasks.length - 1; i++) {
          expect(tasks[i].createdAt).toBeLessThanOrEqual(tasks[i + 1].createdAt);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: bloomlist-garden, Property 9: Task deletion removes exactly the target

/**
 * **Validates: Requirements 6.3**
 *
 * Property 9: Task deletion removes exactly the target
 * For any DayState with at least one task, deleting a task by its ID shall
 * result in a new state where the list length has decreased by exactly one,
 * the deleted task's ID is absent from the list, and all other tasks remain
 * unchanged in their original order.
 */

// Arbitrary: generates a DayState with at least one task
const dayStateWithTasks: fc.Arbitrary<DayState> = fc
  .record({
    date: fc.constantFrom('2024-01-01', '2024-06-15', '2025-03-20'),
    tasks: fc.array(taskArb, { minLength: 1, maxLength: 20 }),
  })
  .map((state) => ({
    ...state,
    tasks: state.tasks.sort((a, b) => a.createdAt - b.createdAt),
  }));

describe('taskReducer — Property 9: Task deletion removes exactly the target', () => {
  it('deleting a task decreases list length by one, removes the target ID, and preserves remaining tasks in order', () => {
    fc.assert(
      fc.property(
        dayStateWithTasks.chain((state) =>
          fc.record({
            state: fc.constant(state),
            targetIndex: fc.integer({ min: 0, max: state.tasks.length - 1 }),
          })
        ),
        ({ state, targetIndex }) => {
          const targetTask = state.tasks[targetIndex];
          const previousLength = state.tasks.length;

          const newState = taskReducer(state, {
            type: 'DELETE_TASK',
            id: targetTask.id,
          });

          // List length decreased by exactly one
          expect(newState.tasks.length).toBe(previousLength - 1);

          // Deleted task's ID is absent from the list
          const remainingIds = newState.tasks.map((t) => t.id);
          expect(remainingIds).not.toContain(targetTask.id);

          // All other tasks remain unchanged in their original order
          const expectedRemaining = state.tasks.filter(
            (t) => t.id !== targetTask.id
          );
          expect(newState.tasks).toEqual(expectedRemaining);
        }
      ),
      { numRuns: 100 }
    );
  });
});
