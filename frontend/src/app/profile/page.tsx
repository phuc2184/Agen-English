"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  const avatarLetter = (user.username?.[0] || user.email?.[0] || 'U').toUpperCase();

  return (
    <>
      <AppHeader title="Hồ sơ" />
      
      <main className="scroll-area">
        <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--accent)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            fontWeight: '800',
            color: '#0b1a1a'
          }}>
            {avatarLetter}
          </div>
          <h2 style={{ color: 'white', marginBottom: '4px' }}>{user.username || user.email.split('@')[0]}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Level 12 • Streak 7 ngày</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '12px', background: 'var(--bg-item)' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>2.4k</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tổng XP</div>
            </div>
            <div className="card" style={{ padding: '12px', background: 'var(--bg-item)' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>15</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bài học</div>
            </div>
          </div>

          <button className="btn btn-outline" onClick={handleLogout} style={{ width: '100%' }}>
            Đăng xuất
          </button>
        </div>

        <div className="card" style={{ marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Cài đặt</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Thông báo</span>
              <div style={{ width: '40px', height: '20px', background: 'var(--accent)', borderRadius: '10px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Chế độ tối</span>
              <div style={{ width: '40px', height: '20px', background: 'var(--accent)', borderRadius: '10px' }}></div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
