"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { scorePronunciation, type ScoringResult, type WordResult } from '@/lib/scoring-engine';

export default function SpeakPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const recognitionRef = useRef<any>(null);

  const targetSentence = "The quick brown fox jumps over the lazy dog";

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === 'SUPER_ADMIN') {
          setIsAdmin(true);
        }
      }
    } catch {}
  }, []);

  const startRecording = () => {
    setResult(null);
    setStatus('recording');
    setIsRecording(true);

    // Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: simulate for environments without Web Speech API
      setStatus('recording');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      processResult(transcript, confidence);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setStatus('idle');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    // If Web Speech API didn't fire (no result yet), simulate
    if (status === 'recording' && !result) {
      // Simulate a realistic imperfect transcript
      const simulated = "The quick brown fox jumped over the lazy dog";
      processResult(simulated, 0.82);
    }
  };

  const processResult = (transcript: string, confidence: number) => {
    setStatus('processing');

    const scored = scorePronunciation(targetSentence, transcript);

    // Admin debug log
    if (isAdmin) {
      console.group('%c🔍 [ADMIN DEBUG] Speech AI Scoring', 'color: #FFD700; font-weight: bold;');
      console.log('%cTarget:', 'color: #a8e6cf;', targetSentence);
      console.log('%cUser Input:', 'color: #ff8b8b;', transcript);
      console.log('%cAPI Confidence:', 'color: #87ceeb;', `${(confidence * 100).toFixed(1)}%`);
      console.log('%cLevenshtein Distance:', 'color: #dda0dd;', scored.debugLog.levenshteinDistance);
      console.log('%cMax Length:', 'color: #dda0dd;', scored.debugLog.maxLen);
      console.log('%cWord Match Rate:', 'color: #87ceeb;', `${(scored.debugLog.wordMatchRate * 100).toFixed(1)}%`);
      console.log('%cPronunciation:', 'color: #a8e6cf;', `${scored.pronunciationScore}%`);
      console.log('%cFluency:', 'color: #a8e6cf;', `${scored.fluencyScore}%`);
      console.log('%cOverall:', 'font-weight: bold;', `${scored.overallScore}% — ${scored.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log('%cWord Results:', 'color: #87ceeb;', scored.wordResults);
      console.groupEnd();
    }

    setResult(scored);
    setStatus('idle');
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
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

        {result && (
          <div className={styles.feedbackArea}>
            {/* Word-by-word highlighting */}
            <div className={styles.wordHighlight}>
              {result.wordResults.map((wr: WordResult, i: number) => (
                <span
                  key={i}
                  className={wr.correct ? styles.wordCorrect : styles.wordWrong}
                  title={wr.correct ? 'Correct' : `Expected: "${wr.expected}"`}
                >
                  {wr.word}
                </span>
              ))}
            </div>

            {/* Score pills */}
            <div className={styles.scoreRow}>
              <div className={`${styles.scorePill} ${result.pronunciationScore >= 85 ? styles.scoreGood : styles.scoreBad}`}>
                Pronunciation: {result.pronunciationScore}%
              </div>
              <div className={`${styles.scorePill} ${result.fluencyScore >= 85 ? styles.scoreGood : styles.scoreBad}`}>
                Fluency: {result.fluencyScore}%
              </div>
            </div>

            {/* Verdict banner */}
            <div className={result.passed ? styles.verdictPass : styles.verdictFail}>
              {result.passed ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  Good — {result.overallScore}%
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1l22 22M1 23L23 1"/></svg>
                  Try Again — {result.overallScore}%
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.bottomSection}>
        <button 
          onClick={toggleRecording}
          className={`${styles.recordBtn} ${isRecording ? styles.recording : ''}`}
          disabled={status === 'processing'}
        >
          {status === 'processing' ? 'Scoring...' : isRecording ? 'Stop Recording' : 'Start Speaking'}
        </button>
      </div>
    </div>
  );
}
