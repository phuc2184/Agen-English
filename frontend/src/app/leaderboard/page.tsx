"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';

interface Badge {
  id: string;
  name: string;
  icon: string;
}

interface UserRank {
  id: string;
  username: string;
  email: string;
  total_xp: number;
  current_level: number;
  role: string;
  badges: Badge[];
}

import { API_URL } from '@/lib/constants';

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/gamification/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        // Mock data if fetch fails
        setUsers([
          { id: '1', username: 'Phúc Admin', email: 'phuc@agen.edu.vn', total_xp: 5400, current_level: 12, role: 'SUPER_ADMIN', badges: [{id:'1', name:'Champion', icon:'🏆'}] },
          { id: '2', username: 'Minh English', email: 'minh@test.com', total_xp: 4200, current_level: 10, role: 'USER', badges: [] },
          { id: '3', username: 'Hương Học Giỏi', email: 'huong@test.com', total_xp: 3800, current_level: 9, role: 'USER', badges: [] },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Fallback mock
      setUsers([
        { id: '1', username: 'Phúc Admin', email: 'phuc@agen.edu.vn', total_xp: 5400, current_level: 12, role: 'SUPER_ADMIN', badges: [{id:'1', name:'Champion', icon:'🏆'}] },
        { id: '2', username: 'Minh English', email: 'minh@test.com', total_xp: 4200, current_level: 10, role: 'USER', badges: [] },
        { id: '3', username: 'Hương Học Giỏi', email: 'huong@test.com', total_xp: 3800, current_level: 9, role: 'USER', badges: [] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="Bảng xếp hạng" />
      
      <main className="scroll-area">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Đang tải...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((user, index) => {
              const isAdmin = user.role === 'SUPER_ADMIN';
              return (
                <div key={user.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '800', 
                    color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--text-muted)',
                    width: '30px'
                  }}>
                    {index + 1}
                  </div>
                  
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: isAdmin ? 'var(--accent)' : '#2a3b44', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: isAdmin ? '#0b1a1a' : 'white',
                    fontWeight: '700'
                  }}>
                    {(user.username?.[0] || user.email?.[0]).toUpperCase()}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: 'white' }}>
                      {user.username || user.email.split('@')[0]}
                      {isAdmin && <span style={{ marginLeft: '4px' }}>👑</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Level {user.current_level}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{user.total_xp}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>XP</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}
