import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReplayStep } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { PixelButton } from '../common/PixelButton';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  FastForward,
  X,
  ChevronsRight,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAudio } from '@/hooks/useAudio';

interface ReplayPlaybackProps {
  steps: ReplayStep[];
  currentStep: ReplayStep | null;
  onStepChange: (step: ReplayStep | null) => void;
  onClose: () => void;
}

export const ReplayPlayback: React.FC<ReplayPlaybackProps> = ({
  steps,
  currentStep,
  onStepChange,
  onClose,
}) => {
  const { playClick } = useAudio();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const currentIndex = currentStep?.stepIndex ?? 0;
  const timerRef = useRef<number | null>(null);

  const goToStep = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, index));
    if (clamped >= 0 && clamped < steps.length) {
      onStepChange(steps[clamped]);
    }
  }, [steps, onStepChange]);

  const playNext = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      goToStep(currentIndex + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, steps.length, goToStep]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setTimeout(() => {
        playNext();
      }, 2000 / speed);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex, speed, playNext]);

  useEffect(() => {
    if (currentIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [currentIndex, steps.length]);

  const togglePlay = () => {
    playClick();
    if (currentIndex >= steps.length - 1 && !isPlaying) {
      goToStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleClose = () => {
    playClick();
    setIsPlaying(false);
    onStepChange(null);
    onClose();
  };

  const progressPercent = steps.length > 1 
    ? (currentIndex / (steps.length - 1)) * 100 
    : 0;

  return (
    <PixelPanel title="实验回放" variant="dark">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-green-400" />
            <span className="font-pixel text-xs text-stone-300">
              步骤 {currentIndex + 1} / {steps.length}
            </span>
          </div>
          <PixelButton
            variant="danger"
            size="sm"
            icon={<X className="w-3 h-3" />}
            onClick={handleClose}
          >
            结束回放
          </PixelButton>
        </div>

        <div>
          <div className="w-full h-4 bg-stone-700 border-2 border-black relative cursor-pointer"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              goToStep(Math.round(percent * (steps.length - 1)));
            }}
          >
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-600 to-green-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-6 bg-white border-2 border-black"
              style={{ left: `calc(${progressPercent}% - 6px)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-pixel text-xs text-white drop-shadow-lg">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <PixelButton
            variant="secondary"
            size="sm"
            icon={<SkipBack className="w-3 h-3" />}
            onClick={() => { playClick(); goToStep(0); }}
            title="跳到开始"
          />
          <PixelButton
            variant="secondary"
            size="sm"
            icon={<SkipBack className="w-3 h-3 rotate-180" />}
            onClick={() => { playClick(); goToStep(currentIndex - 1); }}
            disabled={currentIndex === 0}
            title="上一步"
          />
          <PixelButton
            variant={isPlaying ? "warning" : "success"}
            size="md"
            icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            onClick={togglePlay}
          >
            {isPlaying ? '暂停' : '播放'}
          </PixelButton>
          <PixelButton
            variant="secondary"
            size="sm"
            icon={<SkipForward className="w-3 h-3" />}
            onClick={() => { playClick(); goToStep(currentIndex + 1); }}
            disabled={currentIndex >= steps.length - 1}
            title="下一步"
          />
          <PixelButton
            variant="secondary"
            size="sm"
            icon={<FastForward className="w-3 h-3" />}
            onClick={() => { playClick(); goToStep(steps.length - 1); }}
            title="跳到结束"
          />
        </div>

        <div className="bg-stone-800 p-3 border-2 border-black">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-yellow-400" />
              <span className="font-pixel text-xs text-stone-400">播放速度</span>
            </div>
            <div className="flex items-center gap-1">
              {[0.5, 1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => { playClick(); setSpeed(s); }}
                  className={cn(
                    'px-2 py-1 font-pixel text-[10px] border-2 transition-all',
                    speed === s
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : 'bg-stone-900 border-stone-600 text-stone-400 hover:border-stone-500'
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {currentStep && (
          <div className="bg-cyan-900/30 p-3 border-2 border-cyan-600">
            <div className="flex items-start gap-2">
              <ChevronsRight className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-pixel text-xs text-cyan-300 mb-1">
                  步骤 {currentIndex + 1} 描述
                </div>
                <div className="font-pixel text-xs text-white break-words">
                  {currentStep.description || '初始状态'}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-stone-900 p-2 border-2 border-black">
          <div className="font-pixel text-[10px] text-stone-500 text-center">
            💡 回放模式下可以观看烧杯状态和实验记录同步变化
          </div>
        </div>
      </div>
    </PixelPanel>
  );
};
