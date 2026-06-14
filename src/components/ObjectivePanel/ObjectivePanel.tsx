import React from 'react';
import { Level, ObjectiveCheckResult, StarPrediction } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { Target, Star, AlertCircle, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ObjectivePanelProps {
  level: Level;
  progress: number;
  isComplete: boolean;
  showHint?: boolean;
  detailedCheck?: ObjectiveCheckResult | null;
  starPrediction?: StarPrediction | null;
  currentSteps: number;
}

export const ObjectivePanel: React.FC<ObjectivePanelProps> = ({
  level,
  progress,
  isComplete,
  showHint = false,
  detailedCheck,
  starPrediction,
  currentSteps,
}) => {
  const { starThresholds } = level;

  const getStepStatus = (threshold: number, stars: number) => {
    if (isComplete) {
      return currentSteps <= threshold ? 'achieved' : 'missed';
    }
    return currentSteps <= threshold ? 'on-track' : 'at-risk';
  };

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
                isComplete ? 'bg-green-500' : progress > 0.7 ? 'bg-yellow-500' : 'bg-orange-500'
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

        {detailedCheck && (
          <div className="bg-stone-800 p-3 border-2 border-black">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span className="font-pixel text-sm text-white">详细进度</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-stone-400">当前值</span>
                <span className="font-pixel text-xs text-cyan-300">
                  {detailedCheck.currentValue}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-stone-400">目标值</span>
                <span className="font-pixel text-xs text-yellow-300">
                  {detailedCheck.targetValue}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-700">
                <div className="flex items-center gap-2">
                  {detailedCheck.complete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  )}
                  <span className={cn(
                    'font-pixel text-xs',
                    detailedCheck.complete ? 'text-green-400' : 'text-orange-400'
                  )}>
                    {detailedCheck.difference}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-stone-800 p-3 border-2 border-black">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-pixel text-xs text-stone-300">星级标准</span>
            </div>
            {starPrediction && !isComplete && (
              <div className="flex items-center gap-1">
                <span className="font-pixel text-[10px] text-cyan-400">
                  预测: {starPrediction.currentStars}⭐
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {[
              { stars: 3, threshold: starThresholds.three, label: '⭐⭐⭐' },
              { stars: 2, threshold: starThresholds.two, label: '⭐⭐' },
              { stars: 1, threshold: starThresholds.one, label: '⭐' },
            ].map(({ stars, threshold, label }) => {
              const status = getStepStatus(threshold, stars);
              const isCurrentTarget = starPrediction && 
                !isComplete && 
                starPrediction.stepsToNextStar > 0 &&
                ((stars === 3 && starPrediction.currentStars === 2) ||
                 (stars === 2 && starPrediction.currentStars === 1));
              
              return (
                <div 
                  key={stars}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 border-2 transition-all',
                    status === 'achieved' && 'bg-green-900/50 border-green-600',
                    status === 'missed' && 'bg-red-900/30 border-red-700',
                    status === 'on-track' && 'bg-stone-700 border-stone-500',
                    status === 'at-risk' && 'bg-orange-900/30 border-orange-600',
                    isCurrentTarget && 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-stone-800'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs">{label}</span>
                    {status === 'achieved' && (
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    )}
                    {status === 'missed' && (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                    {isCurrentTarget && (
                      <span className="font-pixel text-[10px] text-cyan-400 animate-pulse">
                        还差 {starPrediction?.stepsToNextStar} 步
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'font-pixel text-xs',
                    status === 'achieved' ? 'text-green-300' : 
                    status === 'missed' ? 'text-red-400' :
                    status === 'on-track' ? 'text-stone-300' : 'text-orange-300'
                  )}>
                    ≤{threshold}步
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-stone-700">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-stone-400">当前步数</span>
              <span className={cn(
                'font-pixel text-sm',
                currentSteps <= starThresholds.three ? 'text-green-400' :
                currentSteps <= starThresholds.two ? 'text-yellow-400' :
                currentSteps <= starThresholds.one ? 'text-orange-400' : 'text-red-400'
              )}>
                {currentSteps} / {starThresholds.one} 步
              </span>
            </div>
          </div>
        </div>

        {isComplete && (
          <div className="bg-green-900 p-3 border-2 border-green-600 text-center">
            <div className="font-pixel text-lg text-green-300 animate-pulse">
              🎉 目标完成！
            </div>
            {starPrediction && (
              <div className="mt-2 flex justify-center gap-1">
                {[1, 2, 3].map(i => (
                  <Star
                    key={i}
                    className={cn(
                      'w-6 h-6',
                      i <= starPrediction.currentStars
                        ? 'text-yellow-400 fill-yellow-400 animate-bounce'
                        : 'text-stone-600'
                    )}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            )}
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
