# Implementation Plan: Bloomlist Garden

## Overview

This plan implements a gamified daily task tracker as a React 18 + TypeScript single-page application. Tasks are represented as plants in a visual garden that grow and bloom upon completion. The app uses Vite for building, CSS Modules for styling, localStorage for persistence, and Vitest + fast-check for testing. Implementation proceeds from project scaffolding through core logic, UI components, animations, and integration.

## Tasks

- [ ] 1. Set up project structure and core types
  - [ ] 1.1 Initialize Vite + React + TypeScript project and install dependencies
    - Run `npm create vite@latest` with React TypeScript template or configure manually
    - Install dev dependencies: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom`
    - Configure `vite.config.ts` with test settings for Vitest (jsdom environment)
    - Set up `tsconfig.json` with strict mode enabled
    - Create directory structure: `src/components/`, `src/services/`, `src/hooks/`, `src/types/`, `src/styles/`, `src/__tests__/`
    - _Requirements: 7.1, 8.1_

  - [ ] 1.2 Define core TypeScript interfaces and types
    - Create `src/types/index.ts` with `GrowthStage`, `Task`, `DayState`, `StorageResult`, `TaskAction` types
    - Define `TaskInputProps`, `TaskItemProps`, `PlantProps`, `GardenPanelProps` component prop interfaces
    - Define `StorageService` and `DayBoundaryService` interfaces
    - _Requirements: 1.1, 1.6, 2.1, 3.2_

- [ ] 2. Implement state management and core logic
  - [ ] 2.1 Implement the taskReducer function
    - Create `src/hooks/useTaskState.ts` (or `src/reducers/taskReducer.ts`)
    - Implement `ADD_TASK`: generate UUID, trim title, validate non-empty/non-whitespace, enforce max 20, append with createdAt timestamp
    - Implement `TOGGLE_TASK`: flip completed boolean for matching task ID
    - Implement `DELETE_TASK`: remove task by ID
    - Implement `LOAD_STATE`: replace state with loaded DayState
    - Implement `RESET_DAY`: return empty DayState with new date
    - Ensure tasks remain ordered by createdAt after all operations
    - _Requirements: 1.1, 1.2, 1.4, 1.6, 1.7, 2.1, 6.3_

  - [ ]* 2.2 Write property tests for taskReducer — valid addition
    - **Property 1: Valid task addition grows the list**
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property tests for taskReducer — whitespace rejection
    - **Property 2: Whitespace-only titles are rejected**
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Write property tests for taskReducer — ordering invariant
    - **Property 3: Task list ordering invariant**
    - **Validates: Requirements 1.2**

  - [ ]* 2.5 Write property tests for taskReducer — max 20 tasks
    - **Property 4: Maximum 20 tasks invariant**
    - **Validates: Requirements 1.6, 1.7**

  - [ ]* 2.6 Write property tests for taskReducer — deletion removes target only
    - **Property 9: Task deletion removes exactly the target**
    - **Validates: Requirements 6.3**

  - [ ] 2.7 Implement derived state helper functions
    - Create `src/utils/gardenHelpers.ts`
    - Implement `getGrowthStage(task: Task): GrowthStage` — returns 'blooming' if completed, 'seed' if not
    - Implement `getProgress(tasks: Task[]): { completed: number; total: number }`
    - Implement `isCelebration(tasks: Task[]): boolean` — true when non-empty and all completed
    - _Requirements: 2.4, 3.3, 3.5, 3.6_

  - [ ]* 2.8 Write property tests for derived state helpers
    - **Property 5: Plant count equals task count**
    - **Property 6: Growth stage determined by completion state**
    - **Property 7: Progress counter derivation**
    - **Property 8: Celebration condition**
    - **Validates: Requirements 1.3, 2.2, 2.3, 2.4, 3.2, 3.3, 3.5, 3.6, 6.4, 6.5**

- [ ] 3. Implement storage and day boundary services
  - [ ] 3.1 Implement StorageService
    - Create `src/services/storageService.ts`
    - Implement `isAvailable()`: feature-detect localStorage with try/catch
    - Implement `save(state: DayState)`: serialize to JSON, write to `bloomlist_day_{date}` key, handle quota errors
    - Implement `load(date: string)`: read key, parse JSON, validate structure, return null on failure
    - Handle corrupted data gracefully (return null, log warning)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.2 Write property tests for StorageService
    - **Property 10: Day state isolation**
    - **Property 11: Serialization round-trip**
    - **Property 12: Corrupt storage graceful handling**
    - **Validates: Requirements 5.1, 5.2, 5.3, 7.1, 7.2, 7.5**

  - [ ] 3.3 Implement DayBoundaryService
    - Create `src/services/dayBoundaryService.ts`
    - Implement `getCurrentDate()`: return YYYY-MM-DD in local timezone
    - Implement `onDayChange(callback)`: use `setInterval` (every 60s) to check if date has changed, call callback on change, return cleanup function
    - _Requirements: 5.1, 5.2, 5.4_

- [ ] 4. Checkpoint — Verify core logic and services
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement UI components — Task management
  - [ ] 5.1 Implement TaskInput component
    - Create `src/components/TaskInput/TaskInput.tsx` and `TaskInput.module.css`
    - Render text input with `maxLength={150}` and submit button
    - Validate: show inline error for empty/whitespace-only submission
    - Show limit-reached message and disable input when `taskCount >= maxTasks`
    - Clear input on successful submission
    - Ensure submit button has minimum 44x44px touch target
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7, 8.3_

  - [ ] 5.2 Implement TaskItem component
    - Create `src/components/TaskItem/TaskItem.tsx` and `TaskItem.module.css`
    - Render checkbox (toggle), task title, and delete button
    - Apply strikethrough style and checked state when completed
    - Ensure completion state is perceivable without color (strikethrough + check icon)
    - On delete button click, show confirmation (e.g., window.confirm or inline confirm)
    - Ensure all interactive elements meet 44x44px minimum touch target
    - _Requirements: 2.1, 2.5, 6.1, 6.2, 8.3_

  - [ ] 5.3 Implement TaskList component
    - Create `src/components/TaskList/TaskList.tsx` and `TaskList.module.css`
    - Render list of TaskItem components in creation order
    - Show empty state message when no tasks exist
    - _Requirements: 1.2, 6.6_

  - [ ]* 5.4 Write unit tests for TaskInput, TaskItem, and TaskList components
    - Test TaskInput: submit valid title, reject empty, show limit message
    - Test TaskItem: toggle, delete with confirmation, visual states
    - Test TaskList: renders items in order, shows empty state
    - _Requirements: 1.1, 1.4, 1.7, 2.1, 6.1, 6.2_

- [ ] 6. Implement UI components — Garden display
  - [ ] 6.1 Implement Plant component with CSS growth animations
    - Create `src/components/Plant/Plant.tsx` and `Plant.module.css`
    - Render four distinct visual Growth_Stages (seed, sprout, budding, blooming) using CSS classes
    - Each stage must differ in at least two of: size, color, shape/structural detail
    - Animate through all four stages sequentially over 1–2 seconds when task completes
    - Support animation cancellation: if state changes during animation, apply final state within 150ms
    - Revert to seed immediately (no animation) when task marked incomplete while no animation is in progress
    - Use CSS animations + `onAnimationEnd` or `requestAnimationFrame` for stage transitions
    - _Requirements: 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 6.2 Implement GardenGrid and GardenPanel components
    - Create `src/components/GardenPanel/GardenPanel.tsx`, `GardenGrid.tsx`, and CSS modules
    - Render one Plant per task in a responsive grid layout
    - Pass growth stage and animation state to each Plant
    - Show bare garden plot when no tasks exist
    - _Requirements: 3.1, 3.2, 6.4, 6.6_

  - [ ] 6.3 Implement CelebrationOverlay component
    - Create `src/components/CelebrationOverlay/CelebrationOverlay.tsx` and CSS module
    - Display confetti/particle effect when all tasks are complete (non-empty list)
    - Animation lasts 2–5 seconds
    - Remove celebration when any task is marked incomplete
    - _Requirements: 3.5, 3.6_

  - [ ]* 6.4 Write unit tests for Plant, GardenPanel, and CelebrationOverlay
    - Test Plant renders correct stage, applies animation classes
    - Test GardenPanel renders correct number of plants
    - Test CelebrationOverlay appears/disappears based on completion state
    - _Requirements: 3.2, 3.5, 4.1_

- [ ] 7. Checkpoint — Verify UI components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement layout, header, and app shell
  - [ ] 8.1 Implement Header component
    - Create `src/components/Header/Header.tsx` and `Header.module.css`
    - Display app title ("Bloomlist"), current date, and progress counter ("X of Y complete")
    - _Requirements: 2.4_

  - [ ] 8.2 Implement responsive MainLayout component
    - Create `src/components/MainLayout/MainLayout.tsx` and `MainLayout.module.css`
    - Side-by-side layout (TaskPanel left, Garden right) at ≥768px viewport
    - Stacked layout (TaskPanel above Garden) at <768px viewport
    - Use CSS media queries or container queries; no horizontal scrolling on mobile
    - Adapt dynamically on resize without page reload
    - _Requirements: 8.1, 8.2, 8.4_

  - [ ] 8.3 Implement StorageWarning component
    - Create `src/components/StorageWarning/StorageWarning.tsx` and CSS module
    - Show persistent warning banner when localStorage is unavailable or write fails
    - _Requirements: 7.4_

  - [ ]* 8.4 Write unit tests for Header, MainLayout, and StorageWarning
    - Test Header displays progress correctly
    - Test layout classes change at breakpoint
    - Test StorageWarning visibility based on storage availability
    - _Requirements: 2.4, 7.4, 8.1, 8.2_

- [ ] 9. Wire everything together in the App component
  - [ ] 9.1 Implement App component with full state management
    - Create/update `src/App.tsx`
    - Initialize `useReducer` with `taskReducer`
    - On mount: check storage availability, load state for current date (or start empty), set up day boundary listener
    - On state change: persist to localStorage via StorageService
    - Pass handlers (addTask, toggleTask, deleteTask) to TaskPanel components
    - Pass task array and derived state to GardenPanel
    - Display StorageWarning when storage is unavailable
    - Clean up day boundary listener on unmount
    - _Requirements: 1.1, 2.1, 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.2 Implement custom hook useTaskManager
    - Create `src/hooks/useTaskManager.ts`
    - Encapsulate reducer, storage persistence, and day boundary detection
    - Expose: `state`, `addTask`, `toggleTask`, `deleteTask`, `storageAvailable`
    - Handle day reset: when day changes, dispatch RESET_DAY
    - _Requirements: 5.1, 5.4, 7.1_

  - [ ]* 9.3 Write integration tests for full task lifecycle
    - Test: create task → verify in list and garden → complete → verify blooming → delete → verify removed
    - Test: day reset clears state
    - Test: storage round-trip with localStorage mock
    - _Requirements: 1.1, 2.2, 5.1, 6.3, 7.2_

- [ ] 10. Final checkpoint — Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The app uses TypeScript throughout with strict mode enabled
- CSS Modules provide scoped styling; CSS custom properties enable theming
- All interactive elements must meet 44x44px minimum touch targets for accessibility

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "3.1", "3.3"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "3.2"] },
    { "id": 4, "tasks": ["2.8", "5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["5.4", "6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["6.4", "8.1", "8.2", "8.3"] },
    { "id": 7, "tasks": ["8.4", "9.1", "9.2"] },
    { "id": 8, "tasks": ["9.3"] }
  ]
}
```
