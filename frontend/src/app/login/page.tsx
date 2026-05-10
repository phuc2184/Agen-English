import React from 'react';
import { AuthCard } from '@/components/AuthCard';
import { BaseInput } from '@/components/BaseInput';
import { BaseButton } from '@/components/BaseButton';
import styles from './page.module.css';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <AuthCard title="Welcome Back">
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
            placeholder="Enter your password" 
          />
        </div>
        
        <div className={styles.bottomSection}>
          <BaseButton type="submit" className={styles.submitButton}>
            Login
          </BaseButton>
          <p className={styles.linkText}>
            Don't have an account? <Link href="/register" className={styles.link}>Register</Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
