# Architecture

## Overview

Bloomlist is a single-page React app with unidirectional data flow. There's no backend — all state lives in the browser via `useReducer` and persists to `localStorage`. It's hosted as static files on AWS S3 behind CloudFront.

## Project Structure

```
.
├── src/                     # Application source
│   ├── App.tsx              # Root component, wires everything together
│   ├── main.tsx             # React entry point
│   ├── types/index.ts       # All TypeScript interfaces and types
│   ├── reducers/
│   │   └── taskReducer.ts   # Pure state reducer (ADD, TOGGLE, DELETE, LOAD, RESET)
│   ├── services/
│   │   ├── storageService.ts    # localStorage read/write with validation
│   │   └── dayBoundaryService.ts # Midnight detection (60s polling)
│   ├── hooks/
│   │   └── useTaskManager.ts    # Encapsulates reducer + storage + day boundary
│   ├── utils/
│   │   └── gardenHelpers.ts     # Derived state (growth stage, progress, celebration)
│   ├── components/
│   │   ├── Header/              # Title, date, progress counter
│   │   ├── MainLayout/          # Responsive two-panel layout
│   │   ├── TaskInput/           # Add task form with validation
│   │   ├── TaskList/            # Ordered list of TaskItems
│   │   ├── TaskItem/            # Checkbox + title + delete button
│   │   ├── GardenPanel/         # Garden container + animation tracking
│   │   ├── Plant/               # CSS art plant with growth animation
│   │   ├── CelebrationOverlay/  # Confetti particles on 100% completion
│   │   └── StorageWarning/      # Banner when localStorage unavailable
│   └── __tests__/               # Property-based and integration tests
├── infra/                   # AWS CDK infrastructure
│   ├── bin/app.ts           # CDK app entry point
│   ├── lib/bloomlist-stack.ts # Stack definition (S3, CloudFront, ACM, Route53)
│   └── cdk.json             # CDK config with domain context
├── docs/                    # Documentation
└── dist/                    # Production build output (gitignored)
```

## Data Flow

```
User Action → dispatch(action) → taskReducer → new DayState
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                              TaskList          GardenPanel     localStorage
                           (task items)      (plant visuals)    (persistence)
```

1. User interacts (add/toggle/delete)
2. Action dispatched to `taskReducer`
3. New state triggers React re-render
4. `GardenPanel` detects completion transitions and triggers plant animations
5. State persisted to localStorage via `useEffect`

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `useReducer` over `useState` | Predictable state transitions, easier to test as a pure function |
| localStorage, no backend | MVP scope — daily reset makes simple persistence sufficient |
| CSS Modules | Scoped styles without runtime JS cost |
| CSS art for plants | No image assets to load, animatable via class swaps |
| 60s day boundary polling | Simpler than `requestAnimationFrame` loop, acceptable latency |
| Property-based testing | Catches edge cases that example-based tests miss |
| S3 + CloudFront | Cheapest AWS hosting for static sites, global CDN, HTTPS built-in |
| CDK over console/CLI | Reproducible, version-controlled infrastructure |

## Component Hierarchy

```
App
├── StorageWarning
├── Header
└── MainLayout
    ├── TaskPanel
    │   ├── TaskInput
    │   └── TaskList
    │       └── TaskItem[]
    └── GardenPanel
        ├── GardenGrid
        │   └── Plant[]
        └── CelebrationOverlay
```

## State Shape

```typescript
interface DayState {
  date: string;      // "2024-06-15" (YYYY-MM-DD, local timezone)
  tasks: Task[];     // 0-20 items, sorted by createdAt
}

interface Task {
  id: string;        // UUID
  title: string;     // 1-150 chars, trimmed
  completed: boolean;
  createdAt: number; // Unix timestamp ms
}
```

## Storage

- **Key format**: `bloomlist_day_2024-06-15`
- **Value**: JSON-serialized `DayState`
- **Validation**: Structure validated on load; corrupted data discarded gracefully
- **Error handling**: Quota exceeded or unavailable → warning banner, app continues in-memory

## Responsive Breakpoints

| Viewport | Layout |
|----------|--------|
| ≥768px | Side-by-side (tasks left, garden right) |
| <768px | Stacked (tasks above garden) |

Handled via CSS media query — no JavaScript resize listeners.

## Infrastructure

```
Route 53 (DNS)
    │
    ▼
CloudFront (CDN + HTTPS)
    │
    ▼
S3 Bucket (static files)
```

- **Domain**: Configured via `infra/cdk.json`
- **TLS**: ACM certificate, auto-validated via Route 53
- **CDN**: CloudFront with optimized caching policy
- **SPA routing**: 403/404 errors return index.html (client-side routing support)
- **Region**: us-east-1 (required for CloudFront + ACM)

See [Deployment](DEPLOYMENT.md) for deploy instructions.
