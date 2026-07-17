import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { createStorageService } from '../services/storageService';
import type { DayState, Task } from '../types';

// Feature: bloomlist-garden, Property 10: Day state isolation
// Feature: bloomlist-garden, Property 11: Serialization round-trip
// Feature: bloomlist-garden, Property 12: Corrupt storage graceful handling

/**
 * **Validates: Requirements 5.1, 5.2, 5.3, 7.1, 7.2, 7.5**
 */

// In-memory localStorage mock
function createLocalStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem(key: string): string | null {
      return key in store ? store[key] : null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] ?? null;
    },
  };
}

let mockStorage: Storage;

// --- Arbitraries ---

// Generates a valid YYYY-MM-DD date string
const dateStringArb: fc.Arbitrary<string> = fc
  .record({
    year: fc.integer({ min: 2000, max: 2099 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }), // use 28 to avoid invalid dates
  })
  .map(({ year, month, day }) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });

// Generates two distinct date strings
const twoDistinctDatesArb: fc.Arbitrary<[string, string]> = fc
  .tuple(dateStringArb, dateStringArb)
  .filter(([a, b]) => a !== b);

// Generates a valid Task
const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 150 }).filter((s) => s.trim().length > 0),
  completed: fc.boolean(),
  createdAt: fc.integer({ min: 1_000_000_000_000, max: 1_800_000_000_000 }),
});

// Generates a valid DayState with a specific date
const dayStateForDateArb = (date: string): fc.Arbitrary<DayState> =>
  fc.record({
    date: fc.constant(date),
    tasks: fc.array(taskArb, { minLength: 0, maxLength: 20 }).map((tasks) =>
      tasks.sort((a, b) => a.createdAt - b.createdAt)
    ),
  });

// Generates a valid DayState with a generated date
const dayStateArb: fc.Arbitrary<DayState> = dateStringArb.chain((date) =>
  dayStateForDateArb(date)
);

// Generates strings that are NOT valid JSON serializations of a DayState
const corruptStringArb: fc.Arbitrary<string> = fc.oneof(
  // Random bytes / arbitrary strings
  fc.string({ minLength: 0, maxLength: 500 }),
  // Partial JSON
  fc.constantFrom(
    '{',
    '{"date":',
    '{"date":"2024-01-01"',
    '{"date":"2024-01-01","tasks":[{',
    '[1,2,3]',
    'null',
    'undefined',
    'true',
    '""',
    '42',
  ),
  // Structurally invalid objects (missing required fields)
  fc.constantFrom(
    '{}',
    '{"date":"2024-01-01"}',
    '{"tasks":[]}',
    '{"date":123,"tasks":[]}',
    '{"date":"2024-01-01","tasks":[{"id":"x"}]}',
    '{"date":"2024-01-01","tasks":[{"id":1,"title":"t","completed":true,"createdAt":1000}]}',
    '{"date":"2024-01-01","tasks":[{"id":"x","title":123,"completed":true,"createdAt":1000}]}',
    '{"date":"2024-01-01","tasks":[{"id":"x","title":"t","completed":"yes","createdAt":1000}]}',
    '{"date":"2024-01-01","tasks":[{"id":"x","title":"t","completed":true,"createdAt":"now"}]}',
    '{"date":"2024-01-01","tasks":"not-an-array"}',
  )
);

// --- Tests ---

beforeEach(() => {
  mockStorage = createLocalStorageMock();
  vi.stubGlobal('localStorage', mockStorage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StorageService — Property 10: Day state isolation', () => {

  /**
   * **Validates: Requirements 5.1, 5.2, 5.3**
   *
   * Property 10: Day state isolation
   * For any two distinct date strings, saving state for one date and loading
   * state for the other date shall return either null or a completely
   * independent state—never the first date's data.
   */
  it('saving state for one date and loading for a different date never returns the first date\'s data', () => {
    fc.assert(
      fc.property(
        twoDistinctDatesArb.chain(([date1, date2]) =>
          fc.record({
            date1: fc.constant(date1),
            date2: fc.constant(date2),
            state1: dayStateForDateArb(date1),
          })
        ),
        ({ date1, date2, state1 }) => {
          localStorage.clear();
          const service = createStorageService();

          // Save state for date1
          service.save(state1);

          // Load state for date2
          const loaded = service.load(date2);

          // Should return null (no data for date2) — never date1's data
          if (loaded !== null) {
            // If somehow there is data for date2, it must not be date1's data
            expect(loaded.date).not.toBe(date1);
            expect(loaded).not.toEqual(state1);
          } else {
            expect(loaded).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('StorageService — Property 11: Serialization round-trip', () => {

  /**
   * **Validates: Requirements 7.1, 7.2**
   *
   * Property 11: Serialization round-trip
   * For any valid DayState object, serializing it to localStorage and then
   * deserializing it shall produce a DayState that is deeply equal to the original.
   */
  it('saving and then loading a valid DayState produces a deeply equal result', () => {
    fc.assert(
      fc.property(dayStateArb, (state) => {
        localStorage.clear();
        const service = createStorageService();

        // Save the state
        const result = service.save(state);
        expect(result.success).toBe(true);

        // Load the state back
        const loaded = service.load(state.date);

        // Must be deeply equal to the original
        expect(loaded).toEqual(state);
      }),
      { numRuns: 100 }
    );
  });
});

describe('StorageService — Property 12: Corrupt storage graceful handling', () => {

  /**
   * **Validates: Requirements 7.5**
   *
   * Property 12: Corrupt storage graceful handling
   * For any string that is not a valid JSON serialization of a DayState
   * (including random bytes, partial JSON, and structurally invalid objects),
   * the load function shall return null without throwing an exception.
   */
  it('loading corrupt data returns null without throwing', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        corruptStringArb,
        (date, corruptData) => {
          localStorage.clear();
          const service = createStorageService();

          // Manually inject corrupt data into localStorage
          const key = `bloomlist_day_${date}`;
          localStorage.setItem(key, corruptData);

          // load should return null without throwing
          let result: DayState | null = null;
          let threw = false;

          try {
            result = service.load(date);
          } catch {
            threw = true;
          }

          expect(threw).toBe(false);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
