// src/app/components/SoundPreloader.tsx
'use client';

import { useEffect } from 'react';
import { useSoundStore } from '@/lib/sound/soundStore';

export default function SoundPreloader() {
  const { loadSound, sounds } = useSoundStore();

  useEffect(() => {
    // Only load sounds if they haven't been loaded yet
    if (!sounds['timer_intro']) {
      loadSound('timer_intro', '/sound/timer_intro.mp3');
    }
    if (!sounds['timer_start']) {
      loadSound('timer_start', '/sound/timer_start.mp3');
    }
    if (!sounds['timer_end']) {
      loadSound('timer_end', '/sound/timer_end.mp3');
    }
    if (!sounds['timer_victory']) {
      loadSound('timer_victory', '/sound/timer_victory.mp3');
    }
    console.log('Sounds loaded:', sounds);
  }, [loadSound, sounds]);

  // This component doesn't render anything
  return null;
}
