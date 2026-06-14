import React from 'react';
import { PixelButton } from '../common/PixelButton';
import { Star, Home, RotateCcw, ArrowRight } from 'lucide-react';
import { ScoreResult } from '@/logic/scoring';
import { useAudio } from '@/hooks/useAudio';
import { cn } from '@/lib/utils';

interface ResultModalProps {
  isOpen: boolean;
  result: ScoreResult;
  levelName: string;
  onRestart: () => void;
  onNextLevel: () => void;
  onBackToMenu: () => void;
  hasNextLevel: boolean;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  levelName,
  onRestart,
  onNextLevel,
  onBackToMenu,
  hasNextLevel,
}) => {
  const { playClick } = useAudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 border-4 border-black max-w-md w-full animate-bounce-in">
        <div className="bg-indigo-700 border-b-4 border-black p-4 text-center">
          <h2 className="font-pixel text-2xl text-white">
            {result.stars > 0 ? '关卡完成！' : '挑战失败'}
          </h2>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="font-pixel text-lg text-white mb-2">{levelName}</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3].map(i => (
                <Star
                  key={i}
                  className={cn(
                    'w-12 h-12 transition-all duration-500',
                    i <= result.stars
                      ? 'text-yellow-400 fill-yellow-400 animate-pulse'
                      : 'text-stone-600'
                  )}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="font-pixel text-sm text-stone-300 mb-2">
              {result.feedback}
            </p>
            <div className="font-pixel text-3xl text-cyan-400">
              {result.score} 分
            </div>
          </div>

          <div className="space-y-3">
            {hasNextLevel && result.stars > 0 && (
              <PixelButton
                variant="success"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="w-5 h-5" />}
                onClick={() => {
                  playClick();
                  onNextLevel();
                }}
              >
                下一关
              </PixelButton>
            )}
            <PixelButton
              variant="primary"
              size="lg"
              className="w-full"
              icon={<RotateCcw className="w-5 h-5" />}
              onClick={() => {
                playClick();
                onRestart();
              }}
            >
              重新挑战
            </PixelButton>
            <PixelButton
              variant="secondary"
              size="md"
              className="w-full"
              icon={<Home className="w-5 h-5" />}
              onClick={() => {
                playClick();
                onBackToMenu();
              }}
            >
              返回主菜单
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
};
