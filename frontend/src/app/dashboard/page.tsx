"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';

interface UserState {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  gems: number;
  avatarLetter: string;
}

const MOCK_LESSONS = [
  { id: 1, title: 'Gia đình & Bạn bè', grade: 'Lớp 6', cefr: 'A1', xp: 80, icon: 'fa-user-group' },
  { id: 2, title: 'Thời tiết hôm nay', grade: 'Lớp 7', cefr: 'A2', xp: 100, icon: 'fa-cloud-sun' },
  { id: 3, title: 'Đặt món ăn', grade: 'Lớp 8', cefr: 'A2', xp: 120, icon: 'fa-utensils' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);

  useEffect(() => {
    // Simulate getting user from storage or API
    const stored = localStorage.getItem('user');
    if (!stored) {
      // router.push('/login');
      // For demo purposes, set a default state if not logged in
      setUser({
        name: 'Phúc Admin',
        level: 12,
        xp: 2450,
        xpToNext: 3000,
        streak: 7,
        gems: 340,
        avatarLetter: 'P',
      });
      return;
    }
    const parsed = JSON.parse(stored);
    setUser({
      name: parsed.username || parsed.email || 'User',
      level: 12, // Default mock values
      xp: 2450,
      xpToNext: 3000,
      streak: 7,
      gems: 340,
      avatarLetter: (parsed.username?.[0] || parsed.email?.[0] || 'U').toUpperCase(),
    });
  }, [router]);

  if (!user) return null;

  const progressPercent = Math.floor((user.xp / user.xpToNext) * 100);

  return (
    <>
      <AppHeader user={user} />
      
      <main className="scroll-area">
        <div className="card">
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.streak}🔥</div>
              <div className={styles.statLabel}>Ngày streak</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.xp} XP</div>
              <div className={styles.statLabel}>Kinh nghiệm</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>{user.gems}💎</div>
              <div className={styles.statLabel}>Gem</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px' }}>
            <span>Level {user.level}</span>
            <span>{user.xp} / {user.xpToNext} XP</span>
          </div>
          
          <div className={styles.progressBarBg}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <h3 className={styles.sectionTitle}>Bài học tiếp theo</h3>
        
        <div className={styles.lessonList}>
          {MOCK_LESSONS.map((lesson) => (
            <Link href={`/learn/${lesson.id}`} key={lesson.id} className={styles.lessonItem}>
              <div className={styles.lessonIcon}>
                <i className={`fas ${lesson.icon}`}></i>
              </div>
              <div className={styles.lessonInfo}>
                <div className={styles.lessonTitle}>{lesson.title}</div>
                <div className={styles.lessonMeta}>
                  <span>{lesson.grade}</span>
                  <span>{lesson.cefr}</span>
                </div>
              </div>
              <div className={styles.xpTag}>+{lesson.xp} XP</div>
            </Link>
          ))}
        </div>

        <div className={styles.speakingCard}>
          <i className="fas fa-microphone-alt" style={{ fontSize: '26px', color: 'var(--accent)' }}></i>
          <h4 style={{ marginTop: '8px', color: 'white' }}>Luyện nói AI</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Phát âm câu: "Hello, how are you?"
          </p>
          <button className={styles.micButton}>
            <i className="fas fa-microphone"></i>
          </button>
          <Link href="/speak" className="btn" style={{ marginTop: '6px' }}>
            Bắt đầu nói
          </Link>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
