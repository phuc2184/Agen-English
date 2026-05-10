import React from 'react';
import { AuthCard } from '@/components/AuthCard';
import { BaseInput } from '@/components/BaseInput';
import { BaseButton } from '@/components/BaseButton';
import styles from './page.module.css';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <AuthCard title="Create Account">
      <form className={styles.form}>
        <div className={styles.inputGroup}>
          <BaseInput 
            type="email" 
            label="Email Address" 
            placeholder="Enter your email" 
          />
          <BaseInput 
            type="password" 
            label="Password" 
            placeholder="Create a password" 
          />
        </div>
        
        <div className={styles.bottomSection}>
          <BaseButton type="submit" className={styles.submitButton}>
            Register
          </BaseButton>
          <p className={styles.linkText}>
            Already have an account? <Link href="/login" className={styles.link}>Login</Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
