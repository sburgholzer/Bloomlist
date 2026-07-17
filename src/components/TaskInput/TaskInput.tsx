import { useState, FormEvent } from 'react';
import type { TaskInputProps } from '../../types';
import styles from './TaskInput.module.css';

export function TaskInput({ onAddTask, taskCount, maxTasks }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const isLimitReached = taskCount >= maxTasks;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (isLimitReached) {
      return;
    }

    const trimmed = title.trim();

    if (!trimmed) {
      setError('Please enter a task title.');
      return;
    }

    setError('');
    onAddTask(trimmed);
    setTitle('');
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder={isLimitReached ? 'Task limit reached' : 'Add a new task...'}
          maxLength={150}
          disabled={isLimitReached}
          aria-label="Task title"
          aria-invalid={!!error}
          aria-describedby={error ? 'task-input-error' : undefined}
        />
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLimitReached}
          aria-label="Add task"
        >
          Add
        </button>
      </form>
      {error && (
        <p id="task-input-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
      {isLimitReached && (
        <p className={styles.limitMessage}>
          Daily task limit of {maxTasks} reached.
        </p>
      )}
    </div>
  );
}
