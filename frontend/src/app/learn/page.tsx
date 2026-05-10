import React from 'react';
import styles from './page.module.css';

export default function LearnPage() {
  return (
    <div className={styles.container}>
      <div className={styles.flashcard}>
        <div className={styles.word}>Ambiguous</div>
        <div className={styles.translation}>Mơ hồ, không rõ ràng</div>
        
        {/* Placeholder for SVG Input/Feedback Box if needed */}
        <div className={styles.inputArea}>
          <input type="text" placeholder="Type your answer (optional)" className={styles.answerInput} />
        </div>
      </div>

      <div className={styles.bottomSection}>
        <button className={`${styles.feedbackBtn} ${styles.btnHard}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 14L21 3m0 0h-6.5M21 3v6.5M3 21l11-11"/></svg>
          Hard
        </button>
        <button className={`${styles.feedbackBtn} ${styles.btnGood}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
          Good
        </button>
        <button className={`${styles.feedbackBtn} ${styles.btnEasy}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM8 12l3 3 5-5"/></svg>
          Easy
        </button>
      </div>
    </div>
  );
}
