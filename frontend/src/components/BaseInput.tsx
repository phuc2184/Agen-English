import React from 'react';
import styles from './BaseInput.module.css';

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={`${styles.inputContainer} ${className}`}>
        {label && <label className={styles.label}>{label}</label>}
        <input 
          ref={ref}
          className={`${styles.baseInput} ${error ? styles.errorInput : ''}`}
          {...props} 
        />
        {error && <span className={styles.errorText}>{error}</span>}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';
