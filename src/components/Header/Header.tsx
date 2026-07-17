import styles from './Header.module.css';

interface HeaderProps {
  completed: number;
  total: number;
  date: string; // YYYY-MM-DD formatted
}

/**
 * Formats a YYYY-MM-DD date string into a human-friendly display format.
 * e.g., "2024-06-15" → "June 15, 2024"
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function Header({ completed, total, date }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Bloomlist</h1>
      <div className={styles.meta}>
        <time className={styles.date} dateTime={date}>
          {formatDate(date)}
        </time>
        <span className={styles.progress}>
          {completed} of {total} complete
        </span>
      </div>
    </header>
  );
}
