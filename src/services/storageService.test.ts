import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { DayState } from '../types';

// Create a proper localStorage mock
function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
}

describe('StorageService', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  const validState: DayState = {
    date: '2024-06-15',
    tasks: [
      { id: '1', title: 'Task one', completed: false, createdAt: 1000 },
      { id: '2', title: 'Task two', completed: true, createdAt: 2000 },
    ],
  };

  async function getService() {
    const { createStorageService } = await import('./storageService');
    return createStorageService();
  }

  describe('isAvailable', () => {
    it('returns true when localStorage is accessible', async () => {
      const service = await getService();
      expect(service.isAvailable()).toBe(true);
    });

    it('returns false when localStorage throws on setItem', async () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      const service = await getService();
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('save', () => {
    it('persists state to localStorage with correct key', async () => {
      const service = await getService();
      const result = service.save(validState);
      expect(result).toEqual({ success: true });
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'bloomlist_day_2024-06-15',
        JSON.stringify(validState)
      );
    });

    it('returns quota_exceeded on QuotaExceededError', async () => {
      // Allow isAvailable check to pass, then fail on the actual save
      let callCount = 0;
      mockStorage.setItem.mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        }
      });
      const service = await getService();
      const result = service.save(validState);
      expect(result).toEqual({ success: false, error: 'quota_exceeded' });
    });

    it('returns write_error on generic errors', async () => {
      let callCount = 0;
      mockStorage.setItem.mockImplementation(() => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Unknown write error');
        }
      });
      const service = await getService();
      const result = service.save(validState);
      expect(result).toEqual({ success: false, error: 'write_error' });
    });

    it('returns unavailable when localStorage is not accessible', async () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('SecurityError');
      });
      const service = await getService();
      const result = service.save(validState);
      expect(result).toEqual({ success: false, error: 'unavailable' });
    });
  });

  describe('load', () => {
    it('loads and returns a valid DayState', async () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify(validState));
      const service = await getService();
      const loaded = service.load('2024-06-15');
      expect(loaded).toEqual(validState);
    });

    it('returns null when no data exists for the date', async () => {
      mockStorage.getItem.mockReturnValue(null as unknown as string);
      const service = await getService();
      const loaded = service.load('2024-01-01');
      expect(loaded).toBeNull();
    });

    it('returns null for corrupted JSON', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockStorage.getItem.mockReturnValue('not valid json{{{');
      const service = await getService();
      const loaded = service.load('2024-06-15');
      expect(loaded).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('returns null for structurally invalid data (bad task shape)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockStorage.getItem.mockReturnValue(
        JSON.stringify({ date: '2024-06-15', tasks: [{ bad: 'data' }] })
      );
      const service = await getService();
      const loaded = service.load('2024-06-15');
      expect(loaded).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('returns null when tasks is not an array', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockStorage.getItem.mockReturnValue(
        JSON.stringify({ date: '2024-06-15', tasks: 'not-an-array' })
      );
      const service = await getService();
      const loaded = service.load('2024-06-15');
      expect(loaded).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('returns null when date field is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockStorage.getItem.mockReturnValue(JSON.stringify({ tasks: [] }));
      const service = await getService();
      const loaded = service.load('2024-06-15');
      expect(loaded).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('successfully loads an empty task list', async () => {
      const emptyState: DayState = { date: '2024-06-15', tasks: [] };
      mockStorage.getItem.mockReturnValue(JSON.stringify(emptyState));
      const service = await getService();
      const loaded = service.load('2024-06-15');
      expect(loaded).toEqual(emptyState);
    });
  });
});
