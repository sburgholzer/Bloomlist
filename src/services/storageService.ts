import type { DayState, StorageResult, StorageService, Task } from '../types';

const KEY_PREFIX = 'bloomlist_day_';

function getKey(date: string): string {
  return `${KEY_PREFIX}${date}`;
}

function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.createdAt === 'number'
  );
}

function isValidDayState(value: unknown): value is DayState {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.date !== 'string') return false;
  if (!Array.isArray(obj.tasks)) return false;
  return obj.tasks.every(isValidTask);
}

function createStorageService(): StorageService {
  function isAvailable(): boolean {
    try {
      const testKey = '__bloomlist_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function save(state: DayState): StorageResult {
    if (!isAvailable()) {
      return { success: false, error: 'unavailable' };
    }

    try {
      const key = getKey(state.date);
      const json = JSON.stringify(state);
      localStorage.setItem(key, json);
      return { success: true };
    } catch (error: unknown) {
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        return { success: false, error: 'quota_exceeded' };
      }
      return { success: false, error: 'write_error' };
    }
  }

  function load(date: string): DayState | null {
    if (!isAvailable()) {
      return null;
    }

    try {
      const key = getKey(date);
      const raw = localStorage.getItem(key);

      if (raw === null) {
        return null;
      }

      const parsed: unknown = JSON.parse(raw);

      if (!isValidDayState(parsed)) {
        console.warn(
          `[Bloomlist] Corrupted data for key "${key}". Discarding invalid state.`
        );
        return null;
      }

      return parsed;
    } catch {
      console.warn(
        `[Bloomlist] Failed to parse stored data for date "${date}". Returning null.`
      );
      return null;
    }
  }

  return { isAvailable, save, load };
}

export const storageService = createStorageService();
export { createStorageService };
