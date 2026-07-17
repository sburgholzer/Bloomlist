import styles from './StorageWarning.module.css';

export interface StorageWarningProps {
  visible: boolean;
}

export function StorageWarning({ visible }: StorageWarningProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.banner} role="alert">
      <span className={styles.icon} aria-hidden="true">⚠️</span>
      <p className={styles.message}>
        Warning: Your progress may not be saved. Local storage is unavailable.
      </p>
    </div>
  );
}
