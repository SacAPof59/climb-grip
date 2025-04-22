'use client';

import { useEffect, useRef } from 'react';
import { useSoundStore } from '@/lib/sound/soundStore';

type PhaseType = 'exercise' | 'exerciseRest' | 'stepRest' | 'countdown';

type TimerRadialProgressProps = {
  current: number;
  max: number;
  min?: number;
  phaseType: PhaseType;
  phaseCounter: number;
  isRunning: boolean;
  onSoundPlayed?: (soundType: 'intro' | 'start' | 'end') => void;
  onAudioLoaded?: (isLoaded: boolean) => void;
};

export default function TimerRadialProgressComponent({
  current,
  max,
  min = 0,
  phaseType,
  phaseCounter,
  isRunning,
  onSoundPlayed,
  onAudioLoaded,
}: TimerRadialProgressProps) {
  const { sounds, isLoading, play } = useSoundStore();

  const previousPhaseRef = useRef<PhaseType | null>(null);
  const previousPhaseCounterRef = useRef<number | null>(null);
  const soundPlayedRef = useRef(false);

  // Calculate progress
  const progressValue = Math.round(((current - min) / (max - min)) * 100);

  // Play sounds based on phase transitions
  useEffect(() => {
    // Reset sound played flag when phase changes
    const phaseChanged = previousPhaseRef.current !== phaseType;
    const phaseCounterChanged = previousPhaseCounterRef.current !== phaseCounter;

    if (phaseChanged || phaseCounterChanged) {
      soundPlayedRef.current = false;
      previousPhaseRef.current = phaseType;
      previousPhaseCounterRef.current = phaseCounter;
    }

    if (!isRunning || soundPlayedRef.current) return;

    // Play the appropriate sound based on phase type
    if (phaseType === 'countdown' && current === 3) {
      play('timer_intro');
      soundPlayedRef.current = true;
      if (onSoundPlayed) onSoundPlayed('intro');
    } else if (
      (phaseType === 'exercise' || phaseType === 'exerciseRest' || phaseType === 'stepRest') &&
      current === max
    ) {
      // Play start sound at the beginning of any phase
      play('timer_start');
      soundPlayedRef.current = true;
      if (onSoundPlayed) onSoundPlayed('start');
    } else if (
      (phaseType === 'exercise' || phaseType === 'exerciseRest' || phaseType === 'stepRest') &&
      current === 0
    ) {
      // Play end sound at the end of any phase
      play('timer_end');
      soundPlayedRef.current = true;
      if (onSoundPlayed) onSoundPlayed('end');
    }
  }, [phaseType, phaseCounter, current, max, isRunning, onSoundPlayed, play]);

  // Notify when all audio is loaded
  useEffect(() => {
    if (onAudioLoaded) {
      const allSoundsLoaded = sounds['timer_intro'] && sounds['timer_start'] && sounds['timer_end'];
      onAudioLoaded(!isLoading && !!allSoundsLoaded);
    }
  }, [isLoading, sounds, onAudioLoaded]);

  // Get color class based on phase type
  const getColorClass = () => {
    switch (phaseType) {
      case 'exercise':
        return 'text-primary';
      case 'exerciseRest':
        return 'text-secondary';
      case 'countdown':
        return 'text-warning';
      default:
        return 'text-accent';
    }
  };

  // For countdown, use a different component style
  if (phaseType === 'countdown') {
    return (
      <div className="flex items-center justify-center w-48 h-48 rounded-full bg-base-200">
        <div className="text-8xl font-bold text-warning animate-pulse">{current}</div>
      </div>
    );
  }

  return (
    <div
      className={`radial-progress ${getColorClass()}`}
      style={
        {
          '--value': progressValue,
          '--size': '10rem',
          '--thickness': '1rem',
        } as React.CSSProperties
      }
      role="progressbar"
      aria-valuenow={progressValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="text-center">
        <div className="font-mono text-xl font-bold">
          {String(Math.floor(current / 60)).padStart(2, '0')}:
          {String(current % 60).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
