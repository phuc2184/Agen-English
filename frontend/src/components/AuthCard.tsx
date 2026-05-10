import React from 'react';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title }) => {
  return (
    <div className={styles.cardContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};
