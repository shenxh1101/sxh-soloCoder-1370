import { useCallback, useRef, useEffect, useState } from 'react';

interface AudioState {
  enabled: boolean;
  volume: number;
}

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [state, setState] = useState<AudioState>({
    enabled: true,
    volume: 0.5,
  });

  useEffect(() => {
    const saved = localStorage.getItem('chemLab_audio');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load audio settings:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chemLab_audio', JSON.stringify(state));
  }, [state]);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, enabled }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const playTone = useCallback(
    (
      frequency: number,
      duration: number,
      type: OscillatorType = 'sine',
      volumeMultiplier: number = 1
    ) => {
      if (!state.enabled) return;

      try {
        const ctx = getContext();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        const gain = state.volume * volumeMultiplier;
        gainNode.gain.setValueAtTime(gain, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (e) {
        console.error('Audio playback failed:', e);
      }
    },
    [state.enabled, state.volume, getContext]
  );

  const playBubble = useCallback(() => {
    const baseFreq = 200 + Math.random() * 300;
    playTone(baseFreq, 0.1, 'sine', 0.3);
    setTimeout(() => {
      playTone(baseFreq * 1.5, 0.05, 'sine', 0.2);
    }, 50);
  }, [playTone]);

  const playPour = useCallback(() => {
    const ctx = getContext();
    if (!state.enabled) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(state.volume * 0.4, ctx.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, [state.enabled, state.volume, getContext]);

  const playStir = useCallback(() => {
    const ctx = getContext();
    if (!state.enabled) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / ctx.sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.sin(t * 20) * 0.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(500, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(state.volume * 0.3, ctx.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, [state.enabled, state.volume, getContext]);

  const playSuccess = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.5);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.5), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.5), 200);
  }, [playTone]);

  const playFail = useCallback(() => {
    playTone(311, 0.15, 'sawtooth', 0.3);
    setTimeout(() => playTone(261, 0.2, 'sawtooth', 0.3), 100);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(800, 0.05, 'square', 0.2);
  }, [playTone]);

  const playDrop = useCallback(() => {
    playTone(600, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(400, 0.15, 'sine', 0.3), 50);
  }, [playTone]);

  const playGasRelease = useCallback(() => {
    const ctx = getContext();
    if (!state.enabled) return;

    try {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(state.volume * 0.25, ctx.currentTime);

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, [state.enabled, state.volume, getContext]);

  return {
    enabled: state.enabled,
    volume: state.volume,
    setEnabled,
    setVolume,
    playBubble,
    playPour,
    playStir,
    playSuccess,
    playFail,
    playClick,
    playDrop,
    playGasRelease,
  };
};
