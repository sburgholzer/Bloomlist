# Testing

## Overview

Bloomlist uses a layered testing strategy combining property-based tests, unit tests, and integration tests. The test suite runs in ~2.5 seconds.

```
74 tests across 9 test files
├── 15 property-based tests (fast-check)
├── 36 unit tests (component + service)
├── 20 service tests
└── 3 integration tests
```

## Running Tests

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file changes)
npm run test:watch

# Run a specific test file
npx vitest --run src/__tests__/taskReducer.property.test.ts
```

## Test Structure

```
src/
├── __tests__/
│   ├── taskReducer.property.test.ts    # Properties 1-4, 9
│   ├── gardenHelpers.property.test.ts  # Properties 5-8
│   ├── storageService.property.test.ts # Properties 10-12
│   └── integration.test.tsx            # Full lifecycle tests
├── components/__tests__/
│   ├── TaskComponents.test.tsx         # TaskInput, TaskItem, TaskList
│   ├── GardenComponents.test.tsx       # Plant, GardenPanel, CelebrationOverlay
│   └── LayoutComponents.test.tsx       # Header, MainLayout, StorageWarning
└── services/
    ├── storageService.test.ts          # Unit tests for storage
    └── dayBoundaryService.test.ts      # Unit tests for day boundary
```

## Property-Based Tests

Property-based testing (PBT) generates hundreds of random inputs to verify invariants that must *always* hold true. We use [fast-check](https://github.com/dubzzz/fast-check) with 100 iterations per property.

### Correctness Properties

| # | Property | Validates |
|---|----------|-----------|
| 1 | Valid task addition grows the list by exactly one | Req 1.1 |
| 2 | Whitespace-only titles are rejected (state unchanged) | Req 1.4 |
| 3 | Task list stays sorted by createdAt after any action sequence | Req 1.2 |
| 4 | Task list never exceeds 20 items | Req 1.6, 1.7 |
| 5 | Plant count always equals task count | Req 1.3, 3.2 |
| 6 | Growth stage is blooming if completed, seed if not | Req 2.2, 2.3 |
| 7 | Progress counter matches actual completed count | Req 2.4 |
| 8 | Celebration triggers only when non-empty and all complete | Req 3.5, 3.6 |
| 9 | Deletion removes exactly the target, preserves order | Req 6.3 |
| 10 | Saving for one date doesn't affect another date's data | Req 5.1-5.3 |
| 11 | Save then load produces deeply equal state | Req 7.1, 7.2 |
| 12 | Corrupt data in storage returns null without throwing | Req 7.5 |

### Example Property Test

```typescript
it('task list length never exceeds 20', () => {
  fc.assert(
    fc.property(
      fc.array(validTitle, { minLength: 25, maxLength: 50 }),
      (titles) => {
        let state = createEmptyDayState('2024-01-01');
        for (const title of titles) {
          state = taskReducer(state, { type: 'ADD_TASK', title });
          expect(state.tasks.length).toBeLessThanOrEqual(20);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

## Integration Tests

Three tests render the full `<App />` component and verify end-to-end behavior:

1. **Full lifecycle** — create → verify in list + garden → complete → verify blooming → delete → verify removed
2. **Day reset** — add tasks → trigger day boundary → verify clean slate
3. **Storage round-trip** — add task → verify persisted → remount → verify restored

## Tools

| Tool | Purpose |
|------|---------|
| [Vitest](https://vitest.dev) | Test runner (Vite-native, fast) |
| [React Testing Library](https://testing-library.com/react) | Component rendering + queries |
| [fast-check](https://github.com/dubzzz/fast-check) | Property-based test generation |
| [jsdom](https://github.com/jsdom/jsdom) | Browser environment simulation |

## CI Integration

Tests run as part of the deploy pipeline (`npm run deploy` calls `npm run build` which runs `tsc`). To add a test gate before deploy, you can run:

```bash
npm run test && npm run deploy
```

## Configuration

Test config lives in `vite.config.ts`:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test-setup.ts'],
  css: true,
}
```

The setup file (`src/test-setup.ts`) imports `@testing-library/jest-dom` for extended matchers like `toBeInTheDocument()`.
