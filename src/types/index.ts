// Core Types

export type GrowthStage = 'seed' | 'sprout' | 'budding' | 'blooming';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number; // timestamp for ordering
}

export interface DayState {
  date: string; // ISO date string YYYY-MM-DD
  tasks: Task[];
}

// Storage Types

export type StorageResult =
  | { success: true }
  | { success: false; error: 'unavailable' | 'quota_exceeded' | 'write_error' };

// State Management

export type TaskAction =
  | { type: 'ADD_TASK'; title: string }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'LOAD_STATE'; state: DayState }
  | { type: 'RESET_DAY' };

// Component Props

export interface TaskInputProps {
  onAddTask: (title: string) => void;
  taskCount: number;
  maxTasks: number;
}

export interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface PlantProps {
  growthStage: GrowthStage;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

export interface GardenPanelProps {
  tasks: Task[];
  allComplete: boolean;
}

// Service Interfaces

export interface StorageService {
  save(state: DayState): StorageResult;
  load(date: string): DayState | null;
  isAvailable(): boolean;
}

export interface DayBoundaryService {
  getCurrentDate(): string; // YYYY-MM-DD in local time
  onDayChange(callback: () => void): () => void; // returns cleanup fn
}
