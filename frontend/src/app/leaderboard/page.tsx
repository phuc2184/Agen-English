"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

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

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('http://localhost:3001/gamification/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><p style={{ color: '#8a8a8a' }}>Loading leaderboard...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Global Leaderboard</h1>
      
      <div className={styles.leaderboardList}>
        {users.map((user, index) => {
          const isAdmin = user.username === 'dangphuc99' || user.role === 'SUPER_ADMIN';
          
          return (
            <div 
              key={user.id} 
              className={`${styles.row} ${isAdmin ? styles.adminRow : ''}`}
            >
              <div className={styles.rank}>#{index + 1}</div>
              
              <div className={styles.userInfo}>
                <div className={styles.username}>
                  {user.username || user.email.split('@')[0]}
                  {isAdmin && <span className={styles.goldBadge} title="Super Admin"> 👑</span>}
                </div>
                <div className={styles.levelBadge}>LVL {user.current_level}</div>
                
                <div className={styles.badges}>
                  {user.badges.map((badge) => (
                    <span key={badge.id} className={styles.badgeIcon} title={badge.name}>
                      {badge.icon}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.xpInfo}>
                <div className={styles.xpValue}>{user.total_xp.toLocaleString()}</div>
                <div className={styles.xpLabel}>Total XP</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
