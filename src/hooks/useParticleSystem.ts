import { useRef, useEffect, useCallback } from 'react';
import { ParticleSystem } from '../utils/particle';

export const useParticleSystem = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  beakerHeight: number,
  solutionHeight: number
) => {
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    particleSystemRef.current = new ParticleSystem(200);
    return () => {
      particleSystemRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const emitBubbles = useCallback(
    (count: number, intensity: number = 1) => {
      if (!particleSystemRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const centerX = canvas.width / 2;
      const bottomY = solutionHeight > 0 ? beakerHeight - 30 : beakerHeight - 50;

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          particleSystemRef.current?.emitBubble(centerX, bottomY, intensity);
        }, i * 50);
      }
    },
    [beakerHeight, solutionHeight, canvasRef]
  );

  const emitPrecipitate = useCallback(
    (count: number, color: string, intensity: number = 1) => {
      if (!particleSystemRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const centerX = canvas.width / 2;
      const startY = solutionHeight > 0 ? beakerHeight - solutionHeight + 20 : beakerHeight / 2;

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          particleSystemRef.current?.emitPrecipitate(centerX, startY, color, intensity);
        }, i * 100);
      }
    },
    [beakerHeight, solutionHeight, canvasRef]
  );

  const emitSparks = useCallback(
    (count: number, color: string, intensity: number = 1) => {
      if (!particleSystemRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const centerX = canvas.width / 2;
      const centerY = beakerHeight / 2;

      for (let i = 0; i < count; i++) {
        particleSystemRef.current.emitSpark(centerX, centerY, color, intensity);
      }
    },
    [beakerHeight, canvasRef]
  );

  const clear = useCallback(() => {
    particleSystemRef.current?.clear();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!particleSystemRef.current) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particleSystemRef.current.update(beakerHeight, solutionHeight);
      particleSystemRef.current.draw(ctx);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasRef, beakerHeight, solutionHeight]);

  return {
    emitBubbles,
    emitPrecipitate,
    emitSparks,
    clear,
  };
};
