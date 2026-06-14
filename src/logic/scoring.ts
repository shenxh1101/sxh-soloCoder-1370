import { Level } from '../types';

export interface ScoreResult {
  stars: number;
  score: number;
  feedback: string;
}

export const calculateScore = (
  steps: number,
  timeElapsed: number,
  level: Level,
  completed: boolean
): ScoreResult => {
  if (!completed) {
    return {
      stars: 0,
      score: 0,
      feedback: '任务未完成，继续加油！',
    };
  }

  const { starThresholds, maxSteps } = level;

  let stars = 1;
  if (steps <= starThresholds.three) {
    stars = 3;
  } else if (steps <= starThresholds.two) {
    stars = 2;
  }

  const stepScore = Math.max(0, (maxSteps - steps) * 100);
  const timeScore = Math.max(0, 1000 - timeElapsed);
  const starBonus = stars * 500;
  const totalScore = stepScore + timeScore + starBonus;

  let feedback = '';
  if (stars === 3) {
    feedback = '太棒了！完美完成！⭐⭐⭐';
  } else if (stars === 2) {
    feedback = '做得好！还可以更快哦！⭐⭐';
  } else {
    feedback = '完成了！试试用更少的步骤！⭐';
  }

  return {
    stars,
    score: Math.round(totalScore),
    feedback,
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const saveProgress = (levelId: string, stars: number): void => {
  try {
    const saved = localStorage.getItem('chemLab_progress');
    const progress = saved ? JSON.parse(saved) : {};
    const currentStars = progress[levelId] || 0;
    if (stars > currentStars) {
      progress[levelId] = stars;
      localStorage.setItem('chemLab_progress', JSON.stringify(progress));
    }
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

export const loadProgress = (): Record<string, number> => {
  try {
    const saved = localStorage.getItem('chemLab_progress');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to load progress:', e);
    return {};
  }
};

export const getUnlockedLevels = (): string[] => {
  const progress = loadProgress();
  const unlocked: string[] = ['level-1'];

  for (let i = 1; i <= 8; i++) {
    const prevLevel = `level-${i}`;
    const nextLevel = `level-${i + 1}`;
    if (progress[prevLevel] && progress[prevLevel] >= 1) {
      if (!unlocked.includes(nextLevel)) {
        unlocked.push(nextLevel);
      }
    }
  }

  return unlocked;
};
