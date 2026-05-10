"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import styles from './MultimediaPlayer.module.css';

interface MultimediaPlayerProps {
  src: string;
  type?: 'video' | 'audio';
  poster?: string;
}

export default function MultimediaPlayer({ src, type = 'video', poster }: MultimediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const current = mediaRef.current.currentTime;
      const total = mediaRef.current.duration;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(formatTime(mediaRef.current.duration));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (mediaRef.current) {
      mediaRef.current.currentTime = pos * mediaRef.current.duration;
    }
  };

  return (
    <div className={styles.playerContainer}>
      <div className={styles.videoWrapper}>
        {type === 'video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            poster={poster}
            className={styles.videoElement}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={src}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
        )}
      </div>

      <div className={styles.controls}>
        <button className={styles.playBtn} onClick={togglePlay}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className={styles.progressBar} onClick={seek}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
        </div>

        <div className={styles.timeInfo}>
          {currentTime} / {duration}
        </div>

        <button className={styles.playBtn} onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}
