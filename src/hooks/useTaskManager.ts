import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { taskReducer, createEmptyDayState } from '../reducers/taskReducer';
import { storageService } from '../services/storageService';
import { dayBoundaryService } from '../services/dayBoundaryService';
import type { DayState } from '../types';

export interface UseTaskManagerResult {
  state: DayState;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  storageAvailable: boolean;
}

/**
 * Custom hook that encapsulates task state management, localStorage persistence,
 * and day boundary detection.
 *
 * - Uses useReducer with taskReducer for predictable state transitions
 * - Loads persisted state on mount for the current date
 * - Persists state changes to localStorage
 * - Detects day boundary crossings and resets state
 */
export function useTaskManager(): UseTaskManagerResult {
  const [state, dispatch] = useReducer(taskReducer, createEmptyDayState());
  const [storageAvailable, setStorageAvailable] = useState(true);
  const isInitialMount = useRef(true);

  // On mount: check storage, load state, register day boundary listener
  useEffect(() => {
    const available = storageService.isAvailable();
    setStorageAvailable(available);

    if (available) {
      const currentDate = dayBoundaryService.getCurrentDate();
      const savedState = storageService.load(currentDate);
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', state: savedState });
      }
    }

    // Register day boundary listener
    const cleanup = dayBoundaryService.onDayChange(() => {
      dispatch({ type: 'RESET_DAY' });
    });

    return cleanup;
  }, []);

  // On state change (not initial): persist to localStorage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (storageAvailable) {
      const result = storageService.save(state);
      if (!result.success) {
        setStorageAvailable(false);
      }
    }
  }, [state, storageAvailable]);

  const addTask = useCallback((title: string) => {
    dispatch({ type: 'ADD_TASK', title });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', id });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', id });
  }, []);

  return {
    state,
    addTask,
    toggleTask,
    deleteTask,
    storageAvailable,
  };
}
