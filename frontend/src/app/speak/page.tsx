"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function SpeakPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<{ pronunciation: number; fluency: number } | null>(null);
  const targetSentence = "The quick brown fox jumps over the lazy dog";

  const toggleRecording = () => {
    if (!isRecording) {
      // Simulate starting Web Speech API
      setIsRecording(true);
      setTranscript('');
      setScore(null);
    } else {
      // Simulate stopping and scoring
      setIsRecording(false);
      setTranscript("The quick brown fox jumped over the lazy dog");
      setScore({ pronunciation: 85, fluency: 90 }); // Simulated scoring
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.recordingCard}>
        <div className={styles.targetLabel}>Target Sentence</div>
        <div className={styles.targetSentence}>{targetSentence}</div>

        <div className={styles.waveformContainer}>
          {isRecording ? (
            <div className={styles.waveformActive}>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
              <span className={styles.bar}></span>
            </div>
          ) : (
            <div className={styles.waveformInactive}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
          )}
        </div>

        {transcript && (
          <div className={styles.feedbackArea}>
            <div className={styles.transcriptBox}>
              <strong>You said:</strong> {transcript}
            </div>
            {score && (
              <div className={styles.scoreRow}>
                <div className={`${styles.scorePill} ${score.pronunciation > 80 ? styles.scoreGood : styles.scoreBad}`}>
                  Pronunciation: {score.pronunciation}%
                </div>
                <div className={`${styles.scorePill} ${score.fluency > 80 ? styles.scoreGood : styles.scoreBad}`}>
                  Fluency: {score.fluency}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.bottomSection}>
        <button 
          onClick={toggleRecording}
          className={`${styles.recordBtn} ${isRecording ? styles.recording : ''}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Speaking'}
        </button>
      </div>
    </div>
  );
}
