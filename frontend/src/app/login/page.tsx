"use client";

import React, { useState } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { BaseInput } from '@/components/BaseInput';
import { BaseButton } from '@/components/BaseButton';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome Back">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <BaseInput 
            type="text" 
            label="Email or Username" 
            placeholder="Enter your email or username" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <BaseInput 
            type="password" 
            label="Password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.bottomSection}>
          <BaseButton type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </BaseButton>
          <p className={styles.linkText}>
            Don&apos;t have an account? <Link href="/register" className={styles.link}>Register</Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
