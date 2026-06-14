import { create } from 'zustand';
import { Solution, Reaction, GameState, Recipe, ExperimentLog, StarPrediction, ObjectiveCheckResult } from '../types';
import { createEmptySolution, addReagent, stirSolution, pourOutSolution, checkObjective } from '../logic/chemistry';
import { calculateScore, saveProgress, loadProgress, getUnlockedLevels } from '../logic/scoring';
import { getLevelById } from '../data/levels';
import { getReagentById } from '../data/reagents';
import { hexToRgb } from '../utils/colorMix';

interface GameStore extends GameState {
  activeEffects: { gasIntensity: number; heatIntensity: number };
  activeReactions: string[];
  setMode: (mode: 'menu' | 'challenge' | 'free') => void;
  setCurrentLevel: (levelId: string) => void;
  ensureCurrentLevelFromUrl: (levelId: string) => void;
  addReagentToBeaker: (reagentId: string, volume: number) => Reaction[];
  stir: () => void;
  pourOut: (percentage?: number) => void;
  resetBeaker: () => void;
  checkLevelComplete: () => boolean;
  completeLevel: () => { stars: number; score: number; feedback: string };
  tickTime: () => void;
  exportRecipe: (name: string) => Recipe;
  importRecipe: (recipe: Recipe) => { success: boolean; error?: string };
  addExperimentLog: (type: ExperimentLog['type'], message: string, details?: Record<string, any>) => void;
  clearExperimentLogs: () => void;
  getStarPrediction: () => StarPrediction;
  getDetailedObjectiveCheck: () => ObjectiveCheckResult | null;
}

const initialSolution = createEmptySolution();

const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

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
  experimentLogs: [],
  lastScoreResult: undefined,

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
        experimentLogs: [],
        lastScoreResult: undefined,
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
      experimentLogs: [],
      lastScoreResult: undefined,
    });
    
    get().addExperimentLog(
      'reset',
      `开始挑战：${getLevelById(levelId)?.name || '未知关卡'}`
    );
  },

  ensureCurrentLevelFromUrl: (levelId) => {
    const { currentLevelId, mode } = get();
    const level = getLevelById(levelId);
    
    if (!level) return;
    
    if (!currentLevelId || currentLevelId !== levelId) {
      set({
        currentLevelId: levelId,
        mode: 'challenge',
        solution: createEmptySolution(),
        steps: 0,
        isComplete: false,
        score: 0,
        stars: 0,
        timeElapsed: 0,
        activeReactions: [],
        activeEffects: { gasIntensity: 0, heatIntensity: 0 },
        unlockedLevels: getUnlockedLevels(),
        experimentLogs: [],
        lastScoreResult: undefined,
      });
      
      get().addExperimentLog(
        'reset',
        `开始挑战：${level.name}`
      );
    }
  },

  addExperimentLog: (type, message, details) => {
    const log: ExperimentLog = {
      id: generateLogId(),
      timestamp: Date.now(),
      type,
      message,
      details,
    };
    
    set(state => ({
      experimentLogs: [...state.experimentLogs, log],
    }));
  },

  clearExperimentLogs: () => {
    set({ experimentLogs: [] });
  },

  addReagentToBeaker: (reagentId, volume) => {
    const { solution, steps, experimentLogs } = get();
    const reagent = getReagentById(reagentId);
    
    if (!reagent) return [];
    
    const oldColor = solution.color;
    const oldTemperature = solution.temperature;
    const oldHasGas = solution.hasGas;
    const oldHasPrecipitate = solution.hasPrecipitate;
    
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

    get().addExperimentLog(
      'add_reagent',
      `加入 ${reagent.name} ${volume}mL`,
      {
        reagentId,
        reagentName: reagent.name,
        volume,
        formula: reagent.formula,
      }
    );
    
    if (result.reactions.length > 0) {
      for (const reaction of result.reactions) {
        get().addExperimentLog(
          'reaction',
          reaction.description,
          {
            reactionId: reaction.id,
            equation: reaction.equation,
            products: reaction.products,
          }
        );
        
        for (const product of reaction.products) {
          if (product.type === 'gas') {
            get().addExperimentLog(
              'gas',
              `产生气体！强度: ${Math.round(product.intensity * 100)}%`,
              { intensity: product.intensity }
            );
          } else if (product.type === 'precipitate') {
            get().addExperimentLog(
              'precipitate',
              `生成${product.value.color === '#ffffff' ? '白色' : '有色'}沉淀`,
              { color: product.value.color }
            );
          } else if (product.type === 'heat') {
            const tempChange = product.value * product.intensity;
            if (tempChange > 0) {
              get().addExperimentLog(
                'heat',
                `放热！温度上升 +${tempChange.toFixed(1)}°C`,
                { temperatureChange: tempChange }
              );
            }
          } else if (product.type === 'colorChange') {
            get().addExperimentLog(
              'color_change',
              `颜色变化：${oldColor} → ${product.value}`,
              { fromColor: oldColor, toColor: product.value }
            );
          }
        }
      }
    }
    
    if (result.solution.color !== oldColor && result.reactions.every(r => 
      !r.products.some(p => p.type === 'colorChange')
    )) {
      get().addExperimentLog(
        'color_change',
        `颜色变化：${oldColor} → ${result.solution.color}`,
        { fromColor: oldColor, toColor: result.solution.color }
      );
    }
    
    if (Math.abs(result.solution.temperature - oldTemperature) > 1 && 
        result.reactions.every(r => !r.products.some(p => p.type === 'heat' || p.type === 'cool'))
    ) {
      const change = result.solution.temperature - oldTemperature;
      get().addExperimentLog(
        'heat',
        `温度${change > 0 ? '上升' : '下降'} ${Math.abs(change).toFixed(1)}°C`,
        { temperatureChange: change }
      );
    }

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
    if (solution.volume === 0) return;
    
    set({
      solution: stirSolution(solution),
    });
    
    get().addExperimentLog(
      'stir',
      '搅拌溶液，加速反应和温度平衡'
    );
  },

  pourOut: (percentage = 0.5) => {
    const { solution } = get();
    if (solution.volume === 0) return;
    
    const newSolution = pourOutSolution(solution, percentage);
    const pouredVolume = (solution.volume - newSolution.volume).toFixed(1);
    
    set({
      solution: newSolution,
      activeEffects: { gasIntensity: 0, heatIntensity: 0 },
    });
    
    get().addExperimentLog(
      'pour_out',
      `倒出 ${pouredVolume}mL 溶液（剩余 ${newSolution.volume.toFixed(1)}mL）`,
      { pouredPercentage: percentage, remainingVolume: newSolution.volume }
    );
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
      experimentLogs: [],
      lastScoreResult: undefined,
    });
    
    get().addExperimentLog('reset', '重置烧杯，清空所有溶液');
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
    const { currentLevelId, steps, timeElapsed, isComplete, solution } = get();
    if (!currentLevelId) {
      return { stars: 0, score: 0, feedback: '请先选择关卡' };
    }

    const level = getLevelById(currentLevelId);
    if (!level) {
      return { stars: 0, score: 0, feedback: '关卡不存在' };
    }

    const result = calculateScore(steps, timeElapsed, level, isComplete);
    saveProgress(currentLevelId, result.stars);
    
    const finalResult = {
      ...result,
    };
    
    set({
      stars: result.stars,
      score: result.score,
      unlockedLevels: getUnlockedLevels(),
      lastScoreResult: finalResult,
    });

    get().addExperimentLog(
      'reset',
      `关卡完成！${result.feedback}`,
      {
        stars: result.stars,
        score: result.score,
        finalPH: solution.ph,
        finalTemperature: solution.temperature,
        steps,
        timeElapsed,
      }
    );

    return finalResult;
  },

  tickTime: () => {
    set(state => ({ timeElapsed: state.timeElapsed + 1 }));
  },

  getStarPrediction: (): StarPrediction => {
    const { currentLevelId, steps, isComplete } = get();
    const level = currentLevelId ? getLevelById(currentLevelId) : null;
    
    if (!level) {
      return { currentStars: 0, maxPossibleStars: 0, stepsToNextStar: 0 };
    }
    
    const { starThresholds } = level;
    
    const calcStars = (s: number): number => {
      if (s <= starThresholds.three) return 3;
      else if (s <= starThresholds.two) return 2;
      else return 1;
    };

    let currentStars: number;
    if (isComplete) {
      currentStars = calcStars(steps);
    } else {
      currentStars = calcStars(steps);
    }
    
    const maxPossibleStars = calcStars(steps);
    
    let stepsToNextStar = 0;
    if (currentStars === 2) {
      const needed = starThresholds.three - steps;
      stepsToNextStar = needed > 0 ? needed : 0;
    } else if (currentStars === 1) {
      const needed = starThresholds.two - steps;
      stepsToNextStar = needed > 0 ? needed : 0;
    }
    
    return { currentStars, maxPossibleStars, stepsToNextStar };
  },

  getDetailedObjectiveCheck: (): ObjectiveCheckResult | null => {
    const { solution, currentLevelId } = get();
    const level = currentLevelId ? getLevelById(currentLevelId) : null;
    
    if (!level) return null;
    
    const objective = level.objective;
    const result = checkObjective(solution, objective);
    
    let currentValue = '';
    let targetValue = '';
    let difference = '';
    
    switch (objective.type) {
      case 'ph':
      case 'neutralize':
        currentValue = `pH ${solution.ph.toFixed(2)}`;
        targetValue = objective.type === 'neutralize' 
          ? `pH 7.0 (±${objective.tolerance})` 
          : `pH ${objective.targetValue} (±${objective.tolerance})`;
        const phDiff = Math.abs(solution.ph - (objective.type === 'neutralize' ? 7 : objective.targetValue));
        difference = phDiff <= objective.tolerance 
          ? '✓ 已达标' 
          : `偏差 ${phDiff.toFixed(2)}，${solution.ph < (objective.type === 'neutralize' ? 7 : objective.targetValue) ? '偏酸' : '偏碱'}`;
        break;
      case 'color':
        currentValue = solution.color;
        targetValue = objective.targetValue;
        const targetRgb = hexToRgb(objective.targetValue);
        const currentRgb = hexToRgb(solution.color);
        const colorDiff = Math.sqrt(
          Math.pow(targetRgb.r - currentRgb.r, 2) +
          Math.pow(targetRgb.g - currentRgb.g, 2) +
          Math.pow(targetRgb.b - currentRgb.b, 2)
        );
        difference = colorDiff <= objective.tolerance 
          ? '✓ 颜色已匹配' 
          : `色差 ${colorDiff.toFixed(0)} / ${objective.tolerance}`;
        break;
      case 'temperature':
        currentValue = `${solution.temperature.toFixed(1)}°C`;
        targetValue = `≥ ${objective.targetValue}°C`;
        difference = solution.temperature >= objective.targetValue 
          ? '✓ 已达标' 
          : `还差 ${(objective.targetValue - solution.temperature).toFixed(1)}°C`;
        break;
      case 'precipitate':
        currentValue = solution.hasPrecipitate ? '有沉淀' : '无沉淀';
        targetValue = '有沉淀生成';
        difference = solution.hasPrecipitate ? '✓ 已生成沉淀' : '还需要生成沉淀';
        break;
      case 'gas':
        currentValue = solution.hasGas ? '有气体' : '无气体';
        targetValue = '有气体生成';
        difference = solution.hasGas ? '✓ 已产生气体' : '还需要产生气体';
        break;
      default:
        currentValue = '未知';
        targetValue = '未知';
        difference = '';
    }
    
    return {
      complete: result.complete,
      progress: result.progress,
      currentValue,
      targetValue,
      difference,
    };
  },

  exportRecipe: (name: string): Recipe => {
    const { solution, experimentLogs } = get();
    const recipe: Recipe = {
      name,
      reagents: solution.components.map(c => ({
        id: c.reagentId,
        amount: c.amount,
      })),
      result: `pH: ${solution.ph.toFixed(2)}, 温度: ${solution.temperature.toFixed(1)}°C, 颜色: ${solution.color}`,
      createdAt: Date.now(),
      version: '1.0',
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

  importRecipe: (recipe: Recipe): { success: boolean; error?: string } => {
    try {
      if (!recipe || !recipe.reagents || !Array.isArray(recipe.reagents)) {
        return { success: false, error: '无效的配方文件格式' };
      }

      if (recipe.reagents.length === 0) {
        return { success: false, error: '配方中没有试剂' };
      }

      let solution = createEmptySolution();
      const logs: { type: ExperimentLog['type']; message: string; details?: Record<string, any> }[] = [];
      const allReactionDescriptions: string[] = [];
      
      logs.push({
        type: 'reset',
        message: `导入配方：${recipe.name || '未命名配方'}`,
        details: { source: 'import' },
      });

      for (const item of recipe.reagents) {
        const reagent = getReagentById(item.id);
        if (!reagent) {
          return { success: false, error: `未知的试剂ID: ${item.id}` };
        }

        const volumeMl = Math.round((item.amount * 1000) / reagent.concentration);
        
        if (volumeMl <= 0 || volumeMl > 500) {
          return { success: false, error: `试剂 ${reagent.name} 的量无效` };
        }

        if (solution.volume + volumeMl > 500) {
          return { success: false, error: '总容量超过500mL限制' };
        }

        const oldColor = solution.color;
        const oldTemperature = solution.temperature;

        const result = addReagent(solution, item.id, volumeMl);
        solution = result.solution;
        
        logs.push({
          type: 'add_reagent',
          message: `加入 ${reagent.name} ${volumeMl}mL`,
          details: {
            reagentId: item.id,
            reagentName: reagent.name,
            volume: volumeMl,
            formula: reagent.formula,
          },
        });

        for (const reaction of result.reactions) {
          allReactionDescriptions.push(reaction.description);
          
          logs.push({
            type: 'reaction',
            message: reaction.description,
            details: {
              reactionId: reaction.id,
              equation: reaction.equation,
            },
          });
          
          for (const product of reaction.products) {
            if (product.type === 'gas') {
              logs.push({
                type: 'gas',
                message: `产生气体！强度: ${Math.round(product.intensity * 100)}%`,
                details: { intensity: product.intensity },
              });
            } else if (product.type === 'precipitate') {
              logs.push({
                type: 'precipitate',
                message: `生成${product.value.color === '#ffffff' ? '白色' : '有色'}沉淀`,
                details: { color: product.value.color },
              });
            } else if (product.type === 'heat') {
              const tempChange = product.value * product.intensity;
              if (tempChange > 0) {
                logs.push({
                  type: 'heat',
                  message: `放热！温度上升 +${tempChange.toFixed(1)}°C`,
                  details: { temperatureChange: tempChange },
                });
              }
            } else if (product.type === 'colorChange') {
              logs.push({
                type: 'color_change',
                message: `颜色变化：${oldColor} → ${product.value}`,
                details: { fromColor: oldColor, toColor: product.value },
              });
            }
          }
        }
        
        if (solution.color !== oldColor && result.reactions.every(r => 
          !r.products.some(p => p.type === 'colorChange')
        )) {
          logs.push({
            type: 'color_change',
            message: `颜色变化：${oldColor} → ${solution.color}`,
            details: { fromColor: oldColor, toColor: solution.color },
          });
        }
        
        if (Math.abs(solution.temperature - oldTemperature) > 1 && 
            result.reactions.every(r => !r.products.some(p => p.type === 'heat' || p.type === 'cool'))
        ) {
          const change = solution.temperature - oldTemperature;
          logs.push({
            type: 'heat',
            message: `温度${change > 0 ? '上升' : '下降'} ${Math.abs(change).toFixed(1)}°C`,
            details: { temperatureChange: change },
          });
        }
      }

      const formattedLogs: ExperimentLog[] = logs.map((log, index) => ({
        id: `imported_log_${index}_${Date.now()}`,
        timestamp: Date.now() - (logs.length - index) * 1000,
        ...log,
      }));

      set({
        solution,
        steps: recipe.reagents.length,
        experimentLogs: formattedLogs,
        isComplete: false,
        score: 0,
        stars: 0,
        timeElapsed: 0,
        reactions: allReactionDescriptions,
        activeReactions: [],
        activeEffects: { gasIntensity: 0, heatIntensity: 0 },
        lastScoreResult: undefined,
      });

      return { success: true };
    } catch (e) {
      console.error('Import error:', e);
      return { success: false, error: '导入失败：' + (e as Error).message };
    }
  },
}));
