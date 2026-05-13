"use client";

import React, { useState } from 'react';
import { AuthCard } from '@/components/common/AuthCard';
import { BaseInput } from '@/components/common/BaseInput';
import { BaseButton } from '@/components/common/BaseButton';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically redirect to login
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Create Account">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          {error && <div style={{ color: '#ff6b6b', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
          <BaseInput 
            type="email" 
            label="Email Address" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <BaseInput 
            type="password" 
            label="Password" 
            placeholder="Create a password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className={styles.bottomSection}>
          <BaseButton type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Register'}
          </BaseButton>
          <p className={styles.linkText}>
            Already have an account? <Link href="/login" className={styles.link}>Login</Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}
