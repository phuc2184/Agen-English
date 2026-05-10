"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { scorePronunciation, type ScoringResult, type WordResult } from '@/lib/scoring-engine';

/** Phoneme-level types matching backend */
interface PhonemeResult {
  phoneme: string;
  score: number;
}

interface SyllableResult {
  syllable: string;
  score: number;
  phonemes: PhonemeResult[];
}

interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType: string;
  syllables: SyllableResult[];
}

interface DeepResult {
  accuracyScore: number;
  fluencyScore: number;
  prosodyScore: number;
  overallScore: number;
  passed: boolean;
  words: WordAssessment[];
  transcript: string;
}

export default function SpeakPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [basicResult, setBasicResult] = useState<ScoringResult | null>(null);
  const [deepResult, setDeepResult] = useState<DeepResult | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [ttsVoice, setTtsVoice] = useState<string>('alloy');
  const recognitionRef = useRef<any>(null);

  const targetSentence = "The quick brown fox jumps over the lazy dog";

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === 'SUPER_ADMIN') setIsAdmin(true);
      }
    } catch {}
  }, []);

  const startRecording = () => {
    setBasicResult(null);
    setDeepResult(null);
    setDrawerOpen(false);
    setStatus('recording');
    setIsRecording(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
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
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);

    if (status === 'recording' && !basicResult) {
      const simulated = "The quick brown fox jumped over the lazy dog";
      processResult(simulated, 0.82);
    }
  };

  const processResult = async (transcript: string, confidence: number) => {
    setStatus('processing');

    // Basic Levenshtein scoring (always runs)
    const scored = scorePronunciation(targetSentence, transcript);

    if (isAdmin) {
      console.group('%c🔍 [ADMIN DEBUG] Speech AI Scoring', 'color: #FFD700; font-weight: bold;');
      console.log('%cTarget:', 'color: #a8e6cf;', targetSentence);
      console.log('%cUser Input:', 'color: #ff8b8b;', transcript);
      console.log('%cAPI Confidence:', 'color: #87ceeb;', `${(confidence * 100).toFixed(1)}%`);
      console.log('%cLevenshtein Distance:', 'color: #dda0dd;', scored.debugLog.levenshteinDistance);
      console.log('%cPronunciation:', 'color: #a8e6cf;', `${scored.pronunciationScore}%`);
      console.log('%cFluency:', 'color: #a8e6cf;', `${scored.fluencyScore}%`);
      console.log('%cOverall:', 'font-weight: bold;', `${scored.overallScore}% — ${scored.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.groupEnd();
    }

    setBasicResult(scored);

    // Deep assessment (admin only, calls backend)
    if (isAdmin) {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://localhost:3001/speech/assess', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ targetText: targetSentence, userInput: transcript }),
        });

        if (res.ok) {
          const deep = await res.json();
          setDeepResult(deep);

          console.group('%c🧠 [ADMIN] Deep Phoneme Analysis', 'color: #FFD700; font-weight: bold;');
          console.log('%cAccuracy:', 'color: #a8e6cf;', `${deep.accuracyScore}%`);
          console.log('%cFluency:', 'color: #87ceeb;', `${deep.fluencyScore}%`);
          console.log('%cProsody:', 'color: #dda0dd;', `${deep.prosodyScore}%`);
          console.table(deep.words.map((w: WordAssessment) => ({
            Word: w.word,
            Score: w.accuracyScore,
            Error: w.errorType,
            Syllables: w.syllables.map((s: SyllableResult) => `${s.syllable}(${s.score})`).join(' '),
          })));
          console.groupEnd();
        }
      } catch (e) {
        console.warn('Deep assessment unavailable:', e);
      }
    }

    setStatus('idle');
  };

  const toggleRecording = () => {
    if (!isRecording) startRecording();
    else stopRecording();
  };

  const playTTS = async () => {
    if (!isAdmin) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:3001/speech/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: targetSentence, voice: ttsVoice }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      }
    } catch (e) {
      console.warn('TTS unavailable:', e);
    }
  };

  /** Score color helper */
  const scoreColor = (score: number) => {
    if (score >= 85) return '#a8e6cf';
    if (score >= 60) return '#ffe0a3';
    return '#ff8b8b';
  };

  return (
    <div className={styles.container}>
      <div className={styles.recordingCard}>
        <div className={styles.targetLabel}>Target Sentence</div>
        <div className={styles.targetSentence}>{targetSentence}</div>

        {/* TTS controls (admin only) */}
        {isAdmin && (
          <div className={styles.ttsRow}>
            <select
              value={ttsVoice}
              onChange={(e) => setTtsVoice(e.target.value)}
              className={styles.voiceSelect}
            >
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="shimmer">Shimmer</option>
            </select>
            <button onClick={playTTS} className={styles.ttsBtn} title="Listen (AI Voice)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            </button>
          </div>
        )}

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

        {basicResult && (
          <div className={styles.feedbackArea}>
            {/* Word-by-word highlighting */}
            <div className={styles.wordHighlight}>
              {basicResult.wordResults.map((wr: WordResult, i: number) => (
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
              <div className={`${styles.scorePill} ${basicResult.pronunciationScore >= 85 ? styles.scoreGood : styles.scoreBad}`}>
                Pronunciation: {basicResult.pronunciationScore}%
              </div>
              <div className={`${styles.scorePill} ${basicResult.fluencyScore >= 85 ? styles.scoreGood : styles.scoreBad}`}>
                Fluency: {basicResult.fluencyScore}%
              </div>
            </div>

            {/* Verdict banner */}
            <div className={basicResult.passed ? styles.verdictPass : styles.verdictFail}>
              {basicResult.passed ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  Good — {basicResult.overallScore}%
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Try Again — {basicResult.overallScore}%
                </>
              )}
            </div>

            {/* Detailed Analysis button (admin only) */}
            {isAdmin && deepResult && (
              <button onClick={() => setDrawerOpen(true)} className={styles.detailBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M6 20V4M18 20v-4"/></svg>
                Detailed Analysis
              </button>
            )}
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

      {/* ── Detailed Analysis Drawer ── */}
      {drawerOpen && deepResult && (
        <div className={styles.drawerOverlay} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHandle}></div>
            <h3 className={styles.drawerTitle}>Deep Pronunciation Analysis</h3>

            {/* Score Charts */}
            <div className={styles.chartGrid}>
              {[
                { label: 'Accuracy', value: deepResult.accuracyScore },
                { label: 'Fluency', value: deepResult.fluencyScore },
                { label: 'Prosody', value: deepResult.prosodyScore },
              ].map((chart) => (
                <div key={chart.label} className={styles.chartCard}>
                  <div className={styles.chartRing}>
                    <svg viewBox="0 0 36 36" className={styles.chartSvg}>
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2a2a2a"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={scoreColor(chart.value)}
                        strokeWidth="3"
                        strokeDasharray={`${chart.value}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={styles.chartValue} style={{ color: scoreColor(chart.value) }}>
                      {chart.value}
                    </span>
                  </div>
                  <span className={styles.chartLabel}>{chart.label}</span>
                </div>
              ))}
            </div>

            {/* Word-by-Word with Syllable/Phoneme breakdown */}
            <div className={styles.wordBreakdown}>
              {deepResult.words.map((w, i) => (
                <div key={i} className={styles.wordRow}>
                  <div className={styles.wordHeader}>
                    <span
                      className={styles.wordName}
                      style={{ color: w.errorType === 'None' ? '#a8e6cf' : '#ff8b8b' }}
                    >
                      {w.word}
                    </span>
                    <span className={styles.wordScore} style={{ color: scoreColor(w.accuracyScore) }}>
                      {w.accuracyScore}%
                    </span>
                    {w.errorType !== 'None' && (
                      <span className={styles.errorTag}>{w.errorType}</span>
                    )}
                  </div>
                  {/* Syllable bars */}
                  <div className={styles.syllableRow}>
                    {w.syllables.map((s, j) => (
                      <div key={j} className={styles.syllableItem} title={`Phonemes: ${s.phonemes.map(p => p.phoneme).join('')}`}>
                        <div
                          className={styles.syllableBar}
                          style={{
                            width: `${s.score}%`,
                            backgroundColor: scoreColor(s.score),
                          }}
                        ></div>
                        <span className={styles.syllableText}>{s.syllable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setDrawerOpen(false)} className={styles.drawerClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
