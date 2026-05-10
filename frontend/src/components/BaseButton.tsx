import React from 'react';
import styles from './BaseButton.module.css';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const BaseButton: React.FC<BaseButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`${styles.baseButton} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
