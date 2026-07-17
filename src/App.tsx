import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { Header } from './components/Header/Header';
import MainLayout from './components/MainLayout/MainLayout';
import { TaskInput } from './components/TaskInput/TaskInput';
import { TaskList } from './components/TaskList/TaskList';
import { GardenPanel } from './components/GardenPanel/GardenPanel';
import { CelebrationOverlay } from './components/CelebrationOverlay/CelebrationOverlay';
import { StorageWarning } from './components/StorageWarning/StorageWarning';
import { taskReducer, createEmptyDayState } from './reducers/taskReducer';
import { storageService } from './services/storageService';
import { dayBoundaryService } from './services/dayBoundaryService';
import { getProgress, isCelebration } from './utils/gardenHelpers';

const MAX_TASKS = 20;

function App() {
  const [state, dispatch] = useReducer(taskReducer, createEmptyDayState());
  const [storageAvailable, setStorageAvailable] = useState(true);
  const isInitialLoad = useRef(true);

  // On mount: check storage availability, load state for current date, set up day boundary listener
  useEffect(() => {
    const available = storageService.isAvailable();
    setStorageAvailable(available);

    if (available) {
      const today = dayBoundaryService.getCurrentDate();
      const savedState = storageService.load(today);
      if (savedState) {
        dispatch({ type: 'LOAD_STATE', state: savedState });
      }
    }

    // Mark initial load complete after this effect runs
    isInitialLoad.current = false;
  }, []);

  // Set up day boundary listener
  useEffect(() => {
    const cleanup = dayBoundaryService.onDayChange(() => {
      dispatch({ type: 'RESET_DAY' });
    });

    return cleanup;
  }, []);

  // Persist state to localStorage on every change (skip initial empty load)
  useEffect(() => {
    if (isInitialLoad.current) {
      return;
    }

    if (storageAvailable) {
      const result = storageService.save(state);
      if (!result.success) {
        setStorageAvailable(false);
      }
    }
  }, [state, storageAvailable]);

  // Action handlers
  const addTask = useCallback((title: string) => {
    dispatch({ type: 'ADD_TASK', title });
  }, []);

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TASK', id });
  }, []);

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TASK', id });
  }, []);

  // Derived state
  const progress = getProgress(state.tasks);
  const allComplete = isCelebration(state.tasks);

  const taskPanel = (
    <>
      <TaskInput onAddTask={addTask} taskCount={state.tasks.length} maxTasks={MAX_TASKS} />
      <TaskList tasks={state.tasks} onToggle={toggleTask} onDelete={deleteTask} />
    </>
  );

  const gardenPanel = (
    <>
      <GardenPanel tasks={state.tasks} allComplete={allComplete} />
      <CelebrationOverlay active={allComplete} />
    </>
  );

  return (
    <div>
      <StorageWarning visible={!storageAvailable} />
      <Header completed={progress.completed} total={progress.total} date={state.date} />
      <MainLayout taskPanel={taskPanel} gardenPanel={gardenPanel} />
    </div>
  );
}

export default App;
