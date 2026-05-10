"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserInfo {
  id: string;
  email: string;
  username: string | null;
  role: string;
  is_unlimited: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <span className={styles.username}>
            {user.username || user.email}
          </span>
          {user.role === 'SUPER_ADMIN' && (
            <span className={styles.goldBadge} title="Verified Super Admin">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700" stroke="#DAA520" strokeWidth="1"/>
                <path d="M9 12l2 2 4-4" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Welcome to Agen-English</h2>
          <p className={styles.cardDesc}>Your AI-powered English learning platform.</p>
        </div>

        <div className={styles.navGrid}>
          <Link href="/learn" className={styles.navCard}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>Flashcards</span>
          </Link>
          <Link href="/speak" className={styles.navCard}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
            <span>Speaking</span>
          </Link>
        </div>

        {user.role === 'SUPER_ADMIN' && (
          <div className={styles.adminBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/></svg>
            <span>Super Admin — Unlimited Access Enabled</span>
          </div>
        )}
      </main>
    </div>
  );
}
