import { useEffect, useRef } from 'react';

export function useSound() {
  const yayRef = useRef<HTMLAudioElement | null>(null);
  const buzzerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    yayRef.current = new Audio('/sounds/yay.mp3');
    buzzerRef.current = new Audio('/sounds/buzzer.mp3');
  }, []);

  const play = (ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!ref.current) return;
    ref.current.currentTime = 0;
    ref.current.play().catch(() => {});
  };

  return {
    playYay: () => play(yayRef),
    playBuzzer: () => play(buzzerRef),
  };
}
