import React from 'react';
import styles from './BaseContainer.module.css';

interface BaseContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const BaseContainer: React.FC<BaseContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.baseContainer} ${className}`}>
      {children}
    </div>
  );
};
