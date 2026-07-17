import type { DayState, Task, TaskAction } from '../types';

const MAX_TASKS = 20;

/**
 * Returns the current local date as a YYYY-MM-DD string.
 */
function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates an empty DayState for the given date (defaults to today).
 */
export function createEmptyDayState(date?: string): DayState {
  return {
    date: date ?? getCurrentDate(),
    tasks: [],
  };
}

/**
 * Pure reducer function for managing task state.
 * All actions produce a new DayState with tasks ordered by createdAt.
 */
export function taskReducer(state: DayState, action: TaskAction): DayState {
  switch (action.type) {
    case 'ADD_TASK': {
      const trimmedTitle = action.title.trim();

      // Reject empty or whitespace-only titles
      if (trimmedTitle.length === 0) {
        return state;
      }

      // Enforce maximum 20 tasks
      if (state.tasks.length >= MAX_TASKS) {
        return state;
      }

      const newTask: Task = {
        id: crypto.randomUUID(),
        title: trimmedTitle,
        completed: false,
        createdAt: Date.now(),
      };

      const tasks = [...state.tasks, newTask].sort(
        (a, b) => a.createdAt - b.createdAt
      );

      return { ...state, tasks };
    }

    case 'TOGGLE_TASK': {
      const tasks = state.tasks.map((task) =>
        task.id === action.id ? { ...task, completed: !task.completed } : task
      );
      return { ...state, tasks };
    }

    case 'DELETE_TASK': {
      const tasks = state.tasks.filter((task) => task.id !== action.id);
      return { ...state, tasks };
    }

    case 'LOAD_STATE': {
      return action.state;
    }

    case 'RESET_DAY': {
      return createEmptyDayState();
    }

    default:
      return state;
  }
}
