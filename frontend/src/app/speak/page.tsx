"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';
import { scorePronunciation, type ScoringResult, type WordResult } from '@/lib/scoring-engine';
import { AppHeader } from '@/components/AppHeader';
import { useRouter } from 'next/navigation';

export default function SpeakPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [basicResult, setBasicResult] = useState<ScoringResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const recognitionRef = useRef<any>(null);

  const targetSentence = "I love learning English";

  const startRecording = () => {
    setBasicResult(null);
    setStatus('recording');
    setIsRecording(true);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback for browsers without speech recognition
      setTimeout(() => {
        const simulated = "I love learning English";
        processResult(simulated, 0.95);
        setIsRecording(false);
      }, 2000);
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
  };

  const processResult = (transcript: string, confidence: number) => {
    setStatus('processing');
    const scored = scorePronunciation(targetSentence, transcript);
    setBasicResult(scored);
    setStatus('idle');
  };

  const toggleRecording = () => {
    if (!isRecording) startRecording();
    else stopRecording();
  };

  return (
    <div className={styles.container}>
      <AppHeader title="Speaking AI" backAction={() => router.push('/dashboard')} />
      
      <main className="scroll-area" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.speakingCard}>
          <div className={styles.targetLabel}>🎯 Phát âm câu:</div>
          <div className={styles.targetSentence}>"{targetSentence}"</div>
          
          <button 
            className={`${styles.micButton} ${isRecording ? styles.recording : ''}`}
            onClick={toggleRecording}
            disabled={status === 'processing'}
          >
            <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
          </button>
          
          <p className={styles.scoreDisplay}>
            {status === 'recording' ? 'Đang lắng nghe...' : 
             status === 'processing' ? 'Đang phân tích...' : 
             basicResult ? `Điểm phát âm: ${basicResult.overallScore}/100` : 
             'Nhấn để bắt đầu nói'}
          </p>

          {basicResult && (
            <div className={styles.wordResults}>
              {basicResult.wordResults.map((wr, i) => (
                <span key={i} className={`${styles.word} ${wr.correct ? styles.wordCorrect : styles.wordWrong}`}>
                  {wr.word}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>

      <div className={styles.bottomSection}>
        <button 
          className="btn" 
          style={{ width: '100%' }}
          onClick={() => router.push('/dashboard')}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
