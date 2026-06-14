import { SavedRecipe, ExperimentLog, Solution, ReplayStep, Recipe } from '../types';
import { getReagentById } from '../data/reagents';
import { createEmptySolution, addReagent } from '../logic/chemistry';

const STORAGE_KEY = 'chemLab_savedRecipes';

export const loadSavedRecipes = (): SavedRecipe[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const recipes = JSON.parse(saved);
    return Array.isArray(recipes) ? recipes : [];
  } catch (e) {
    console.error('Failed to load saved recipes:', e);
    return [];
  }
};

export const saveRecipes = (recipes: SavedRecipe[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  } catch (e) {
    console.error('Failed to save recipes:', e);
  }
};

const generateRecipeId = (): string => {
  return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const saveCurrentRecipe = (
  name: string,
  solution: Solution,
  reagents: { id: string; amount: number }[],
  experimentLogs: ExperimentLog[],
  steps: number,
  notes?: string
): SavedRecipe => {
  const newRecipe: SavedRecipe = {
    id: generateRecipeId(),
    name,
    reagents,
    result: {
      ph: solution.ph,
      temperature: solution.temperature,
      color: solution.color,
      hasGas: solution.hasGas,
      hasPrecipitate: solution.hasPrecipitate,
      precipitateColor: solution.precipitateColor,
      volume: solution.volume,
    },
    experimentLogs,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    notes,
    steps,
  };

  const recipes = loadSavedRecipes();
  recipes.push(newRecipe);
  saveRecipes(recipes);
  return newRecipe;
};

export const updateRecipeName = (recipeId: string, newName: string): SavedRecipe | null => {
  const recipes = loadSavedRecipes();
  const index = recipes.findIndex(r => r.id === recipeId);
  if (index === -1) return null;

  recipes[index] = {
    ...recipes[index],
    name: newName,
    updatedAt: Date.now(),
  };
  saveRecipes(recipes);
  return recipes[index];
};

export const updateRecipeNotes = (recipeId: string, notes: string): SavedRecipe | null => {
  const recipes = loadSavedRecipes();
  const index = recipes.findIndex(r => r.id === recipeId);
  if (index === -1) return null;

  recipes[index] = {
    ...recipes[index],
    notes,
    updatedAt: Date.now(),
  };
  saveRecipes(recipes);
  return recipes[index];
};

export const deleteRecipe = (recipeId: string): boolean => {
  const recipes = loadSavedRecipes();
  const filtered = recipes.filter(r => r.id !== recipeId);
  if (filtered.length === recipes.length) return false;
  saveRecipes(filtered);
  return true;
};

export const getRecipeById = (recipeId: string): SavedRecipe | undefined => {
  return loadSavedRecipes().find(r => r.id === recipeId);
};

export const convertRecipeToImportFormat = (recipe: SavedRecipe): Recipe => {
  return {
    name: recipe.name,
    reagents: recipe.reagents,
    result: `pH: ${recipe.result.ph.toFixed(2)}, 温度: ${recipe.result.temperature.toFixed(1)}°C, 颜色: ${recipe.result.color}`,
    createdAt: recipe.createdAt,
    version: '1.0',
  };
};

export const buildReplaySteps = (
  reagents: { id: string; amount: number }[]
): ReplayStep[] => {
  const steps: ReplayStep[] = [];
  
  let solution = createEmptySolution();
  let accumulatedLogs: ExperimentLog[] = [];
  let stepCount = 0;

  steps.push({
    stepIndex: stepCount,
    solution: { ...solution },
    logs: [],
    description: '初始状态：空烧杯',
  });

  for (const item of reagents) {
    const reagent = getReagentById(item.id);
    if (!reagent) continue;

    const volumeMl = Math.round((item.amount * 1000) / reagent.concentration);
    if (volumeMl <= 0) continue;

    const oldColor = solution.color;
    const oldTemperature = solution.temperature;

    const result = addReagent(solution, item.id, volumeMl);
    solution = result.solution;
    stepCount++;

    const stepLogs: ExperimentLog[] = [];
    const logBaseId = `replay_${stepCount}_${Date.now()}`;
    let logIndex = 0;

    stepLogs.push({
      id: `${logBaseId}_${logIndex++}`,
      timestamp: Date.now() + stepCount * 1000,
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
      stepLogs.push({
        id: `${logBaseId}_${logIndex++}`,
        timestamp: Date.now() + stepCount * 1000,
        type: 'reaction',
        message: reaction.description,
        details: {
          reactionId: reaction.id,
          equation: reaction.equation,
        },
      });

      for (const product of reaction.products) {
        if (product.type === 'gas') {
          stepLogs.push({
            id: `${logBaseId}_${logIndex++}`,
            timestamp: Date.now() + stepCount * 1000,
            type: 'gas',
            message: `产生气体！强度: ${Math.round(product.intensity * 100)}%`,
            details: { intensity: product.intensity },
          });
        } else if (product.type === 'precipitate') {
          stepLogs.push({
            id: `${logBaseId}_${logIndex++}`,
            timestamp: Date.now() + stepCount * 1000,
            type: 'precipitate',
            message: `生成${product.value.color === '#ffffff' ? '白色' : '有色'}沉淀`,
            details: { color: product.value.color },
          });
        } else if (product.type === 'heat') {
          const tempChange = product.value * product.intensity;
          if (tempChange > 0) {
            stepLogs.push({
              id: `${logBaseId}_${logIndex++}`,
              timestamp: Date.now() + stepCount * 1000,
              type: 'heat',
              message: `放热！温度上升 +${tempChange.toFixed(1)}°C`,
              details: { temperatureChange: tempChange },
            });
          }
        } else if (product.type === 'colorChange') {
          stepLogs.push({
            id: `${logBaseId}_${logIndex++}`,
            timestamp: Date.now() + stepCount * 1000,
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
      stepLogs.push({
        id: `${logBaseId}_${logIndex++}`,
        timestamp: Date.now() + stepCount * 1000,
        type: 'color_change',
        message: `颜色变化：${oldColor} → ${solution.color}`,
        details: { fromColor: oldColor, toColor: solution.color },
      });
    }

    if (Math.abs(solution.temperature - oldTemperature) > 1 && 
        result.reactions.every(r => !r.products.some(p => p.type === 'heat' || p.type === 'cool'))
    ) {
      const change = solution.temperature - oldTemperature;
      stepLogs.push({
        id: `${logBaseId}_${logIndex++}`,
        timestamp: Date.now() + stepCount * 1000,
        type: 'heat',
        message: `温度${change > 0 ? '上升' : '下降'} ${Math.abs(change).toFixed(1)}°C`,
        details: { temperatureChange: change },
      });
    }

    accumulatedLogs = [...accumulatedLogs, ...stepLogs];

    steps.push({
      stepIndex: stepCount,
      solution: { ...solution },
      logs: [...accumulatedLogs],
      description: stepLogs.map(l => l.message).join('；'),
    });
  }

  return steps;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
