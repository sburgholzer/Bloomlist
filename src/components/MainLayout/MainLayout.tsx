import React from 'react';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  taskPanel: React.ReactNode;
  gardenPanel: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ taskPanel, gardenPanel }) => {
  return (
    <div className={styles.layout}>
      <div className={styles.taskPanel}>{taskPanel}</div>
      <div className={styles.gardenPanel}>{gardenPanel}</div>
    </div>
  );
};

export default MainLayout;
