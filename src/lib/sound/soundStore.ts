import { create } from 'zustand';
import { Howl, HowlOptions } from 'howler';

// Sound State Interface
export interface SoundState {
  currentSound: Howl | null;
  sounds: Record<string, Howl>;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isLoading: boolean;
  error: string | null;

  loadSound: (key: string, src: string | string[], options?: HowlOptions) => void;
  play: (key: string, sprite?: string) => void;
  pause: (key?: string) => void;
  stop: (key?: string) => void;
  setVolume: (volume: number) => void;
  mute: (isMuted?: boolean) => void;
}

// Create Zustand Store
export const useSoundStore = create<SoundState>((set, get) => ({
  currentSound: null,
  sounds: {},
  isPlaying: false,
  isMuted: false,
  volume: 1,
  isLoading: false,
  error: null,

  loadSound: (key, src, options: Partial<Omit<HowlOptions, 'src'>> = {}) => {
    set({ isLoading: true, error: null });

    try {
      const sound = new Howl({
        src,
        ...options,
        onload: function () {
          set(state => ({
            sounds: { ...state.sounds, [key]: sound },
            isLoading: false,
          }));
          options.onload?.call(this, sound.play());
        },
        onloaderror: (_, err) => {
          set({
            isLoading: false,
            error: `Failed to load sound ${key}: ${err}`,
          });
        },
      });
    } catch (err) {
      set({
        isLoading: false,
        error: `Error creating sound ${key}: ${err}`,
      });
    }
  },

  play: (key, sprite) => {
    const sound = get().sounds[key];
    if (!sound) {
      set({ error: `Sound ${key} not found` });
      return;
    }

    if (get().currentSound) {
      get().currentSound?.stop();
    }

    if (sprite) {
      sound.play(sprite);
    } else {
      sound.play();
    }

    set({
      currentSound: sound,
      isPlaying: true,
    });
  },

  pause: key => {
    const sound = key ? get().sounds[key] : get().currentSound;
    sound?.pause();
    set({ isPlaying: false });
  },

  stop: key => {
    const sound = key ? get().sounds[key] : get().currentSound;
    sound?.stop();
    set({
      currentSound: null,
      isPlaying: false,
    });
  },

  setVolume: volume => {
    Howler.volume(volume);
    set({ volume });
  },

  mute: isMuted => {
    const muteState = isMuted ?? !get().isMuted;
    Howler.mute(muteState);
    set({ isMuted: muteState });
  },
}));
