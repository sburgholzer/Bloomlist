import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Track the day change callback registered by App
let dayChangeCallback: (() => void) | null = null;

// Mock the dayBoundaryService
vi.mock('../services/dayBoundaryService', () => ({
  dayBoundaryService: {
    getCurrentDate: vi.fn(() => '2024-06-15'),
    onDayChange: vi.fn((cb: () => void) => {
      dayChangeCallback = cb;
      return () => {
        dayChangeCallback = null;
      };
    }),
  },
}));

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

describe('Integration: Full task lifecycle', () => {
  let mockStorage: ReturnType<typeof createLocalStorageMock>;
  let confirmSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true) as unknown as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    confirmSpy.mockRestore();
    cleanup();
    vi.resetModules();
  });

  it('create task → verify in list and garden → complete → verify blooming → delete → verify removed', async () => {
    const { default: App } = await import('../App');
    render(<App />);

    // Verify initial state: 0 of 0 complete
    expect(screen.getByText('0 of 0 complete')).toBeInTheDocument();

    // Create a task
    const input = screen.getByLabelText('Task title');
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Water the plants' } });
    fireEvent.click(addButton);

    // Verify task appears in list
    expect(screen.getByText('Water the plants')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 complete')).toBeInTheDocument();

    // Verify plant appears at seed stage
    expect(screen.getByLabelText('Plant stage: seed')).toBeInTheDocument();

    // Complete the task by clicking the checkbox
    const checkbox = screen.getByRole('checkbox', {
      name: /mark "Water the plants" as complete/i,
    });
    fireEvent.click(checkbox);

    // Verify progress updates
    expect(screen.getByText('1 of 1 complete')).toBeInTheDocument();

    // Verify plant reaches blooming stage (after animation)
    await waitFor(() => {
      expect(screen.getByLabelText('Plant stage: blooming')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Delete the task
    const deleteButton = screen.getByRole('button', {
      name: /delete "Water the plants"/i,
    });
    fireEvent.click(deleteButton);

    // Confirm was called
    expect(confirmSpy).toHaveBeenCalled();

    // Verify task and plant are removed
    expect(screen.queryByText('Water the plants')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Plant stage:/)).not.toBeInTheDocument();
    expect(screen.getByText('0 of 0 complete')).toBeInTheDocument();
  });
});

describe('Integration: Day reset clears state', () => {
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
    cleanup();
    vi.resetModules();
  });

  it('adding tasks then triggering day boundary resets to empty state', async () => {
    const { default: App } = await import('../App');
    render(<App />);

    // Add a task
    const input = screen.getByLabelText('Task title');
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Morning exercise' } });
    fireEvent.click(addButton);

    // Verify task exists
    expect(screen.getByText('Morning exercise')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 complete')).toBeInTheDocument();

    // Simulate day boundary change by invoking the registered callback wrapped in act
    act(() => {
      if (dayChangeCallback) {
        dayChangeCallback();
      }
    });

    // Verify state is cleared
    expect(screen.queryByText('Morning exercise')).not.toBeInTheDocument();
    expect(screen.getByText('0 of 0 complete')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Plant stage:/)).not.toBeInTheDocument();
  });
});

describe('Integration: Storage round-trip with localStorage mock', () => {
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
    cleanup();
    vi.resetModules();
  });

  it('persists task to localStorage and restores on re-render', async () => {
    // First render: add a task
    const { default: App } = await import('../App');
    const { unmount } = render(<App />);

    const input = screen.getByLabelText('Task title');
    const addButton = screen.getByRole('button', { name: /add task/i });

    fireEvent.change(input, { target: { value: 'Read a book' } });
    fireEvent.click(addButton);

    // Verify task was added
    expect(screen.getByText('Read a book')).toBeInTheDocument();

    // Verify localStorage.setItem was called with the task data
    // The App persists state on every change via a useEffect
    await waitFor(() => {
      const saveCalls = mockStorage.setItem.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].startsWith('bloomlist_day_')
      );
      expect(saveCalls.length).toBeGreaterThan(0);
      // Check the last save call contains our task
      const lastSave = saveCalls[saveCalls.length - 1];
      const parsed = JSON.parse(lastSave[1] as string);
      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.tasks[0].title).toBe('Read a book');
    });

    // Unmount the first instance
    unmount();

    // Get the stored date from the saved data to use for loading
    // The storageService loads by the current date from dayBoundaryService (mocked as 2024-06-15)
    // but the reducer creates state with the real current date. We need to ensure data is accessible.
    // Put the saved data under the date that dayBoundaryService.getCurrentDate() returns.
    const saveCalls = mockStorage.setItem.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].startsWith('bloomlist_day_')
    );
    const lastSave = saveCalls[saveCalls.length - 1];
    const savedData = lastSave[1] as string;
    // Store this under the mock date key so the re-mounted App finds it
    mockStorage.setItem('bloomlist_day_2024-06-15', savedData);
    // Also update the parsed state's date to match
    const parsed = JSON.parse(savedData);
    parsed.date = '2024-06-15';
    mockStorage.setItem('bloomlist_day_2024-06-15', JSON.stringify(parsed));

    // Re-render with a fresh App instance (re-imports trigger storageService.load)
    vi.resetModules();
    const { default: App2 } = await import('../App');
    render(<App2 />);

    // Verify task is restored from storage
    expect(screen.getByText('Read a book')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 complete')).toBeInTheDocument();
    expect(screen.getByLabelText('Plant stage: seed')).toBeInTheDocument();
  });
});
