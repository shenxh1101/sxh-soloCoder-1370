import React, { useRef, useEffect } from 'react';
import { Solution } from '@/types';
import { useParticleSystem } from '@/hooks/useParticleSystem';
import { useAudio } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';

interface BeakerProps {
  solution: Solution;
  isOver: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  gasIntensity: number;
  heatIntensity: number;
  isStirring: boolean;
  showHint?: boolean;
}

const BEAKER_WIDTH = 280;
const BEAKER_HEIGHT = 320;
const MAX_VOLUME = 500;

export const Beaker: React.FC<BeakerProps> = ({
  solution,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  gasIntensity,
  heatIntensity,
  isStirring,
  showHint = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { emitBubbles, emitPrecipitate, clear } = useParticleSystem(
    canvasRef,
    BEAKER_HEIGHT,
    (solution.volume / MAX_VOLUME) * (BEAKER_HEIGHT - 60)
  );
  const { playBubble, playGasRelease } = useAudio();

  const solutionHeight = Math.min(
    (solution.volume / MAX_VOLUME) * (BEAKER_HEIGHT - 60),
    BEAKER_HEIGHT - 60
  );

  useEffect(() => {
    if (gasIntensity > 0 && solution.volume > 0) {
      const bubbleCount = Math.floor(5 + gasIntensity * 10);
      emitBubbles(bubbleCount, gasIntensity);
      playBubble();
      if (gasIntensity > 1) {
        playGasRelease();
      }
    }
  }, [gasIntensity, solution.volume, emitBubbles, playBubble, playGasRelease]);

  useEffect(() => {
    if (solution.hasPrecipitate && solution.precipitateColor) {
      emitPrecipitate(15, solution.precipitateColor, 1);
    }
  }, [solution.hasPrecipitate, solution.precipitateColor, emitPrecipitate]);

  useEffect(() => {
    if (solution.volume === 0) {
      clear();
    }
  }, [solution.volume, clear]);

  const getTemperatureGlow = () => {
    if (heatIntensity > 0.5 || solution.temperature > 60) {
      return 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    }
    if (solution.temperature < 10) {
      return 'shadow-[0_0_30px_rgba(59,130,246,0.5)]';
    }
    return '';
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative transition-all duration-300',
          getTemperatureGlow(),
          isOver && 'scale-105'
        )}
        style={{ width: BEAKER_WIDTH, height: BEAKER_HEIGHT + 40 }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <svg
          width={BEAKER_WIDTH}
          height={BEAKER_HEIGHT}
          className="absolute top-0 left-0"
          style={{ imageRendering: 'pixelated' }}
        >
          <defs>
            <clipPath id="beaker-clip">
              <path d="M 30 10 L 250 10 L 240 290 L 40 290 Z" />
            </clipPath>
            <linearGradient id="glass-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(129,212,250,0.3)" />
              <stop offset="50%" stopColor="rgba(129,212,250,0.1)" />
              <stop offset="100%" stopColor="rgba(129,212,250,0.3)" />
            </linearGradient>
          </defs>

          {solution.volume > 0 && (
            <g clipPath="url(#beaker-clip)">
              <rect
                x="0"
                y={BEAKER_HEIGHT - solutionHeight}
                width={BEAKER_WIDTH}
                height={solutionHeight}
                fill={solution.color}
                className={cn(
                  'transition-all duration-500',
                  isStirring && 'animate-pulse'
                )}
              />

              {solution.hasPrecipitate && solution.precipitateColor && (
                <rect
                  x="40"
                  y={BEAKER_HEIGHT - 30}
                  width={BEAKER_WIDTH - 80}
                  height="20"
                  fill={solution.precipitateColor}
                  opacity="0.9"
                />
              )}

              {isStirring && (
                <g>
                  {[...Array(5)].map((_, i) => (
                    <circle
                      key={i}
                      cx={BEAKER_WIDTH / 2}
                      cy={BEAKER_HEIGHT - solutionHeight / 2}
                      r={20 + i * 15}
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2"
                      className="animate-spin"
                      style={{ animationDuration: `${3 - i * 0.5}s` }}
                    />
                  ))}
                </g>
              )}
            </g>
          )}

          <path
            d="M 30 10 L 30 20 L 40 290 L 240 290 L 250 20 L 250 10"
            fill="none"
            stroke="#000000"
            strokeWidth="4"
          />
          <path
            d="M 30 10 L 30 20 L 40 290 L 240 290 L 250 20 L 250 10"
            fill="url(#glass-gradient)"
            stroke="#81d4fa"
            strokeWidth="2"
          />
          <path
            d="M 25 5 L 35 5 L 35 15 L 25 15 Z"
            fill="#81d4fa"
            stroke="#000000"
            strokeWidth="2"
          />
          <path
            d="M 245 5 L 255 5 L 255 15 L 245 15 Z"
            fill="#81d4fa"
            stroke="#000000"
            strokeWidth="2"
          />

          {[100, 200, 300, 400, 500].map(vol => {
            const y = BEAKER_HEIGHT - (vol / MAX_VOLUME) * (BEAKER_HEIGHT - 60);
            return (
              <g key={vol}>
                <line
                  x1="35"
                  y1={y}
                  x2="50"
                  y2={y}
                  stroke="#000000"
                  strokeWidth="2"
                />
                <text
                  x="20"
                  y={y + 4}
                  className="font-pixel"
                  fontSize="10"
                  fill="#ffffff"
                  textAnchor="end"
                >
                  {vol}
                </text>
              </g>
            );
          })}
        </svg>

        <canvas
          ref={canvasRef}
          width={BEAKER_WIDTH}
          height={BEAKER_HEIGHT}
          className="absolute top-0 left-0 pointer-events-none"
          style={{ imageRendering: 'pixelated' }}
        />

        {isOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div className="font-pixel text-lg text-white animate-pulse">
              释放添加试剂
            </div>
          </div>
        )}

        {showHint && solution.volume === 0 && !isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="font-pixel text-xs text-stone-500 text-center">
              <p>拖拽试剂到这里</p>
              <p className="mt-1">或点击试剂添加</p>
            </div>
          </div>
        )}

        {solution.isBoiling && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <span className="font-pixel text-sm text-red-400 animate-pulse">
              🔥 沸腾中！
            </span>
          </div>
        )}

        {solution.isFrozen && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <span className="font-pixel text-sm text-blue-400 animate-pulse">
              ❄️ 冻结！
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 font-pixel text-xs text-stone-400">
        容量: {solution.volume.toFixed(0)} / {MAX_VOLUME} mL
      </div>
    </div>
  );
};
