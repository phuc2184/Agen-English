import React from 'react';
import styles from './BottomNav.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Trang chủ', icon: 'fa-home', path: '/dashboard' },
    { name: 'Bài học', icon: 'fa-book-open', path: '/learn' },
    { name: 'BXH', icon: 'fa-trophy', path: '/leaderboard' },
    { name: 'Tôi', icon: 'fa-user', path: '/profile' },
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
            <i className={`fas ${item.icon}`}></i>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
