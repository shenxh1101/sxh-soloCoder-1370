import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Star, Play } from 'lucide-react';
import { PixelButton } from '../common/PixelButton';
import { PixelPanel } from '../common/PixelPanel';
import { LEVELS } from '@/data/levels';
import { loadProgress } from '@/logic/scoring';
import { useAudio } from '@/hooks/useAudio';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

export const LevelSelect: React.FC = () => {
  const navigate = useNavigate();
  const { playClick } = useAudio();
  const unlockedLevels = useGameStore(state => state.unlockedLevels);
  const setCurrentLevel = useGameStore(state => state.setCurrentLevel);
  const progress = React.useMemo(() => loadProgress(), []);

  const handleLevelClick = (levelId: string) => {
    if (!unlockedLevels.includes(levelId)) return;
    playClick();
    setCurrentLevel(levelId);
    navigate(`/challenge/${levelId}`);
  };

  const getStars = (levelId: string): number => {
    return progress[levelId] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-stone-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <PixelButton
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => {
              playClick();
              navigate('/');
            }}
          >
            返回
          </PixelButton>
          <h1 className="font-pixel text-2xl text-white tracking-wider">
            <span className="text-cyan-400">挑战</span>
            <span className="text-pink-400">关卡</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((level, index) => {
            const isUnlocked = unlockedLevels.includes(level.id);
            const stars = getStars(level.id);

            return (
              <PixelPanel
                key={level.id}
                variant={isUnlocked ? 'default' : 'dark'}
                className={cn(
                  'transition-all duration-200',
                  isUnlocked && 'hover:scale-105 cursor-pointer'
                )}
                onClick={() => isUnlocked && handleLevelClick(level.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-10 h-10 flex items-center justify-center font-pixel text-lg border-2 border-black',
                        isUnlocked
                          ? 'bg-indigo-600 text-white'
                          : 'bg-stone-700 text-stone-500'
                      )}
                    >
                      {index + 1}
                    </div>
                    {!isUnlocked && <Lock className="w-5 h-5 text-stone-500" />}
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(i => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i <= stars
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-stone-600'
                        )}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="font-pixel text-sm text-white mb-1">
                  {level.name}
                </h3>
                <p className="font-pixel text-xs text-stone-400 mb-3">
                  {level.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs text-stone-500">
                    目标: {level.objective.description}
                  </span>
                  {isUnlocked && (
                    <Play className="w-5 h-5 text-green-400" />
                  )}
                </div>

                {isUnlocked && level.hint && (
                  <div className="mt-3 pt-3 border-t border-stone-700">
                    <p className="font-pixel text-xs text-amber-400">
                      💡 {level.hint}
                    </p>
                  </div>
                )}
              </PixelPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
};
