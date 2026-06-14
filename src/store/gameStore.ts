import { create } from 'zustand';
import { Solution, Reaction, GameState, Recipe } from '../types';
import { createEmptySolution, addReagent, stirSolution, pourOutSolution, checkObjective } from '../logic/chemistry';
import { calculateScore, saveProgress, loadProgress, getUnlockedLevels } from '../logic/scoring';
import { getLevelById } from '../data/levels';

interface GameStore extends GameState {
  activeEffects: { gasIntensity: number; heatIntensity: number };
  setMode: (mode: 'menu' | 'challenge' | 'free') => void;
  setCurrentLevel: (levelId: string) => void;
  addReagentToBeaker: (reagentId: string, volume: number) => Reaction[];
  stir: () => void;
  pourOut: (percentage?: number) => void;
  resetBeaker: () => void;
  checkLevelComplete: () => boolean;
  completeLevel: () => { stars: number; score: number; feedback: string };
  tickTime: () => void;
  exportRecipe: (name: string) => Recipe;
  activeReactions: string[];
}

const initialSolution = createEmptySolution();

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'menu',
  currentLevelId: undefined,
  solution: initialSolution,
  steps: 0,
  isComplete: false,
  score: 0,
  stars: 0,
  timeElapsed: 0,
  reactions: [],
  activeReactions: [],
  unlockedLevels: getUnlockedLevels(),
  activeEffects: { gasIntensity: 0, heatIntensity: 0 },

  setMode: (mode) => {
    set({ mode });
    if (mode === 'menu') {
      set({
        currentLevelId: undefined,
        solution: createEmptySolution(),
        steps: 0,
        isComplete: false,
        score: 0,
        stars: 0,
        timeElapsed: 0,
        activeReactions: [],
        activeEffects: { gasIntensity: 0, heatIntensity: 0 },
      });
    }
  },

  setCurrentLevel: (levelId) => {
    set({
      currentLevelId: levelId,
      solution: createEmptySolution(),
      steps: 0,
      isComplete: false,
      score: 0,
      stars: 0,
      timeElapsed: 0,
      activeReactions: [],
      activeEffects: { gasIntensity: 0, heatIntensity: 0 },
      unlockedLevels: getUnlockedLevels(),
    });
  },

  addReagentToBeaker: (reagentId, volume) => {
    const { solution, steps } = get();
    const result = addReagent(solution, reagentId, volume);
    
    let gasIntensity = 0;
    let heatIntensity = 0;
    
    for (const reaction of result.reactions) {
      for (const product of reaction.products) {
        if (product.type === 'gas') {
          gasIntensity = Math.max(gasIntensity, product.intensity);
        } else if (product.type === 'heat') {
          heatIntensity = Math.max(heatIntensity, product.intensity);
        }
      }
    }

    set({
      solution: result.solution,
      steps: steps + 1,
      activeReactions: result.reactions.map(r => r.id),
      reactions: [...get().reactions, ...result.reactions.map(r => r.description)],
      activeEffects: {
        gasIntensity,
        heatIntensity,
      },
    });

    setTimeout(() => {
      set(state => ({
        activeEffects: {
          gasIntensity: state.activeEffects.gasIntensity * 0.8,
          heatIntensity: state.activeEffects.heatIntensity * 0.8,
        },
      }));
    }, 1000);

    return result.reactions;
  },

  stir: () => {
    const { solution } = get();
    set({
      solution: stirSolution(solution),
    });
  },

  pourOut: (percentage = 0.5) => {
    const { solution } = get();
    set({
      solution: pourOutSolution(solution, percentage),
      activeEffects: { gasIntensity: 0, heatIntensity: 0 },
    });
  },

  resetBeaker: () => {
    set({
      solution: createEmptySolution(),
      steps: 0,
      isComplete: false,
      score: 0,
      stars: 0,
      timeElapsed: 0,
      activeReactions: [],
      activeEffects: { gasIntensity: 0, heatIntensity: 0 },
    });
  },

  checkLevelComplete: () => {
    const { solution, currentLevelId, isComplete } = get();
    if (isComplete || !currentLevelId) return false;
    
    const level = getLevelById(currentLevelId);
    if (!level) return false;

    const result = checkObjective(solution, level.objective);
    if (result.complete) {
      set({ isComplete: true });
      return true;
    }
    return false;
  },

  completeLevel: () => {
    const { currentLevelId, steps, timeElapsed, isComplete } = get();
    if (!currentLevelId) {
      return { stars: 0, score: 0, feedback: '请先选择关卡' };
    }

    const level = getLevelById(currentLevelId);
    if (!level) {
      return { stars: 0, score: 0, feedback: '关卡不存在' };
    }

    const result = calculateScore(steps, timeElapsed, level, isComplete);
    saveProgress(currentLevelId, result.stars);
    
    set({
      stars: result.stars,
      score: result.score,
      unlockedLevels: getUnlockedLevels(),
    });

    return result;
  },

  tickTime: () => {
    set(state => ({ timeElapsed: state.timeElapsed + 1 }));
  },

  exportRecipe: (name: string): Recipe => {
    const { solution } = get();
    const recipe: Recipe = {
      name,
      reagents: solution.components.map(c => ({
        id: c.reagentId,
        amount: c.amount,
      })),
      result: `pH: ${solution.ph.toFixed(2)}, 温度: ${solution.temperature.toFixed(1)}°C, 颜色: ${solution.color}`,
      createdAt: Date.now(),
    };

    const dataStr = JSON.stringify(recipe, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name || 'recipe'}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return recipe;
  },
}));
