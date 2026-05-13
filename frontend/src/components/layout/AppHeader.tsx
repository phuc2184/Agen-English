import React from 'react';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  user?: {
    name: string;
    level: number;
    avatarLetter: string;
  };
  backAction?: () => void;
  title?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ user, backAction, title }) => {
  return (
    <header className={styles.appHeader}>
      {backAction ? (
        <i 
          className="fas fa-arrow-left" 
          onClick={backAction} 
          style={{ cursor: 'pointer', fontSize: '20px' }}
        ></i>
      ) : (
        <div className={styles.logo}>
          <i className="fas fa-comment-dots"></i>
          <span>Agen-English</span>
        </div>
      )}
      
      {title && <span className={styles.headerTitle}>{title}</span>}

      {user && !title && (
        <div className={styles.userBadge}>
          <div className={styles.avatar}>{user.avatarLetter}</div>
          <span style={{ fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
          <span className={styles.levelBadge}>LV {user.level}</span>
        </div>
      )}
      {!user && !title && <div></div>}
      {title && <div></div>}
    </header>
  );
};
