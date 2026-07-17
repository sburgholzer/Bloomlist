import type { DayBoundaryService } from '../types';

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
 * Registers a callback that fires when the local calendar date changes.
 * Checks every 60 seconds whether the date has advanced.
 * Returns a cleanup function that clears the interval.
 */
function onDayChange(callback: () => void): () => void {
  let lastDate = getCurrentDate();

  const intervalId = setInterval(() => {
    const currentDate = getCurrentDate();
    if (currentDate !== lastDate) {
      lastDate = currentDate;
      callback();
    }
  }, 60_000); // check every 60 seconds

  return () => {
    clearInterval(intervalId);
  };
}

export const dayBoundaryService: DayBoundaryService = {
  getCurrentDate,
  onDayChange,
};
