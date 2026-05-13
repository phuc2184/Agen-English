"use client";

import React from 'react';
import styles from './page.module.css';
import { AppHeader } from '@/components/layout/AppHeader';
import { useRouter } from 'next/navigation';

export default function LearnPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <AppHeader title="Học từ vựng" backAction={() => router.push('/dashboard')} />
      
      <main className="scroll-area">
        <div className={styles.flashcard}>
          <div className={styles.word}>Ambiguous</div>
          <div className={styles.translation}>Mơ hồ, không rõ ràng</div>
          
          <div className={styles.inputArea}>
            <input type="text" placeholder="Gõ câu trả lời của bạn..." className={styles.answerInput} />
          </div>
        </div>
      </main>

      <div className={styles.bottomSection}>
        <button className={`${styles.feedbackBtn} ${styles.btnHard}`}>
          <i className="fas fa-face-frown" style={{ fontSize: '24px' }}></i>
          <span>Khó</span>
        </button>
        <button className={`${styles.feedbackBtn} ${styles.btnGood}`}>
          <i className="fas fa-face-smile" style={{ fontSize: '24px' }}></i>
          <span>Tốt</span>
        </button>
        <button className={`${styles.feedbackBtn} ${styles.btnEasy}`}>
          <i className="fas fa-face-laugh-beam" style={{ fontSize: '24px' }}></i>
          <span>Dễ</span>
        </button>
      </div>
    </div>
  );
}
