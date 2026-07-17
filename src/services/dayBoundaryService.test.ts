import { describe, it, expect, vi, afterEach } from 'vitest';
import { dayBoundaryService } from './dayBoundaryService';

describe('dayBoundaryService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getCurrentDate', () => {
    it('returns a string in YYYY-MM-DD format', () => {
      const date = dayBoundaryService.getCurrentDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns the current local date', () => {
      const now = new Date();
      const expected = [
        String(now.getFullYear()),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');
      expect(dayBoundaryService.getCurrentDate()).toBe(expected);
    });
  });

  describe('onDayChange', () => {
    it('returns a cleanup function', () => {
      const cleanup = dayBoundaryService.onDayChange(() => {});
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('does not call callback when date has not changed', () => {
      vi.useFakeTimers();
      const callback = vi.fn();

      const cleanup = dayBoundaryService.onDayChange(callback);

      // Advance 60 seconds — date hasn't changed
      vi.advanceTimersByTime(60_000);
      expect(callback).not.toHaveBeenCalled();

      cleanup();
    });

    it('calls callback when date changes', () => {
      vi.useFakeTimers();
      const callback = vi.fn();

      // Start at 23:59:30 on a given day
      const startDate = new Date(2024, 5, 15, 23, 59, 30); // June 15, 2024 at 23:59:30
      vi.setSystemTime(startDate);

      const cleanup = dayBoundaryService.onDayChange(callback);

      // Advance 60 seconds — crosses midnight to June 16
      vi.advanceTimersByTime(60_000);
      expect(callback).toHaveBeenCalledTimes(1);

      cleanup();
    });

    it('cleanup function stops interval from firing', () => {
      vi.useFakeTimers();
      const callback = vi.fn();

      const startDate = new Date(2024, 5, 15, 23, 59, 30);
      vi.setSystemTime(startDate);

      const cleanup = dayBoundaryService.onDayChange(callback);
      cleanup();

      // Advance past midnight — callback should NOT fire since we cleaned up
      vi.advanceTimersByTime(60_000);
      expect(callback).not.toHaveBeenCalled();
    });

    it('calls callback only once per date change', () => {
      vi.useFakeTimers();
      const callback = vi.fn();

      const startDate = new Date(2024, 5, 15, 23, 59, 30);
      vi.setSystemTime(startDate);

      const cleanup = dayBoundaryService.onDayChange(callback);

      // First interval tick crosses midnight
      vi.advanceTimersByTime(60_000);
      expect(callback).toHaveBeenCalledTimes(1);

      // Subsequent ticks on the same new day should not call again
      vi.advanceTimersByTime(60_000);
      vi.advanceTimersByTime(60_000);
      expect(callback).toHaveBeenCalledTimes(1);

      cleanup();
    });
  });
});
