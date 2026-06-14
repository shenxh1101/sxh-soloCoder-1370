import React from 'react';
import { Level } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { Target, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObjectivePanelProps {
  level: Level;
  progress: number;
  isComplete: boolean;
  showHint?: boolean;
}

export const ObjectivePanel: React.FC<ObjectivePanelProps> = ({
  level,
  progress,
  isComplete,
  showHint = false,
}) => {
  return (
    <PixelPanel title="挑战目标" variant="dark">
      <div className="space-y-4">
        <div>
          <h3 className="font-pixel text-lg text-white mb-1">{level.name}</h3>
          <p className="font-pixel text-xs text-stone-400">{level.description}</p>
        </div>

        <div className="bg-stone-800 p-3 border-2 border-black">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <span className="font-pixel text-sm text-white">目标</span>
          </div>
          <p className="font-pixel text-xs text-stone-300 mb-3">
            {level.objective.description}
          </p>

          <div className="w-full h-4 bg-stone-700 border-2 border-black relative overflow-hidden">
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 transition-all duration-500',
                isComplete ? 'bg-green-500' : 'bg-yellow-500'
              )}
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-pixel text-xs text-white">
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-stone-800 p-3 border-2 border-black">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-pixel text-xs text-stone-300">星级标准</span>
          </div>
          <div className="flex gap-1">
            <div
              className={cn(
                'px-2 py-1 font-pixel text-xs border-2 border-black',
                level.starThresholds.three >= level.starThresholds.two
                  ? 'bg-green-700 text-white'
                  : 'bg-stone-700 text-stone-400'
              )}
            >
              ⭐⭐⭐ ≤{level.starThresholds.three}步
            </div>
            <div
              className={cn(
                'px-2 py-1 font-pixel text-xs border-2 border-black',
                level.starThresholds.two >= level.starThresholds.one
                  ? 'bg-yellow-700 text-white'
                  : 'bg-stone-700 text-stone-400'
              )}
            >
              ⭐⭐ ≤{level.starThresholds.two}步
            </div>
            <div
              className="px-2 py-1 font-pixel text-xs border-2 border-black bg-stone-700 text-white"
            >
              ⭐ ≤{level.starThresholds.one}步
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="bg-green-900 p-3 border-2 border-green-600 text-center">
            <div className="font-pixel text-lg text-green-300 animate-pulse">
              🎉 目标完成！
            </div>
          </div>
        )}

        {showHint && level.hint && (
          <div className="bg-amber-900 p-3 border-2 border-amber-600">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="font-pixel text-xs text-amber-300">提示</span>
            </div>
            <p className="font-pixel text-xs text-amber-200">
              💡 {level.hint}
            </p>
          </div>
        )}
      </div>
    </PixelPanel>
  );
};
