import { TaskItemProps } from '../../types';
import styles from './TaskItem.module.css';

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const handleToggle = () => {
    onToggle(task.id);
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This cannot be undone.`
    );
    if (confirmed) {
      onDelete(task.id);
    }
  };

  return (
    <li className={styles.taskItem}>
      <button
        className={styles.toggleButton}
        onClick={handleToggle}
        aria-checked={task.completed}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        role="checkbox"
      >
        {task.completed && (
          <svg
            className={styles.checkIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <span
        className={`${styles.title} ${task.completed ? styles.titleCompleted : ''}`}
      >
        {task.title}
      </span>

      <button
        className={styles.deleteButton}
        onClick={handleDelete}
        aria-label={`Delete "${task.title}"`}
      >
        <svg
          className={styles.deleteIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </li>
  );
}
