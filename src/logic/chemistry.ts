import { Solution, SolutionComponent, Reaction, Reagent } from '../types';
import { getReagentById } from '../data/reagents';
import { findMatchingReactions } from './reactions';
import { mixColors, applyIndicatorColor, hexToRgb, rgbToHex } from '../utils/colorMix';

export const createEmptySolution = (): Solution => ({
  volume: 0,
  ph: 7,
  temperature: 25,
  color: '#ffffff',
  components: [],
  hasGas: false,
  hasPrecipitate: false,
  isBoiling: false,
  isFrozen: false,
});

export const addReagent = (
  solution: Solution,
  reagentId: string,
  volumeMl: number
): { solution: Solution; reactions: Reaction[] } => {
  const reagent = getReagentById(reagentId);
  if (!reagent) return { solution, reactions: [] };

  const newVolume = solution.volume + volumeMl;
  const newAmount = (reagent.concentration * volumeMl) / 1000;

  const existingComponent = solution.components.find(
    c => c.reagentId === reagentId
  );

  let newComponents: SolutionComponent[];
  if (existingComponent) {
    newComponents = solution.components.map(c =>
      c.reagentId === reagentId
        ? { ...c, amount: c.amount + newAmount }
        : c
    );
  } else {
    newComponents = [
      ...solution.components,
      { reagentId, amount: newAmount },
    ];
  }

  const componentIds = newComponents.map(c => c.reagentId);
  const matchingReactions = findMatchingReactions(componentIds);

  let newPh = calculatePH(newComponents);
  let newTemperature = calculateTemperature(
    solution,
    reagent,
    volumeMl,
    matchingReactions
  );
  let newColor = calculateColor(newComponents, newPh);

  let hasGas = false;
  let hasPrecipitate = false;
  let precipitateColor: string | undefined;

  for (const reaction of matchingReactions) {
    for (const product of reaction.products) {
      if (product.type === 'gas') {
        hasGas = true;
      } else if (product.type === 'precipitate') {
        hasPrecipitate = true;
        precipitateColor = product.value.color;
      } else if (product.type === 'colorChange') {
        const baseRgb = hexToRgb(newColor);
        const targetRgb = hexToRgb(product.value);
        const blend = product.intensity * 0.5;
        newColor = rgbToHex(
          baseRgb.r * (1 - blend) + targetRgb.r * blend,
          baseRgb.g * (1 - blend) + targetRgb.g * blend,
          baseRgb.b * (1 - blend) + targetRgb.b * blend
        );
      }
    }
  }

  const isBoiling = newTemperature >= 100;
  const isFrozen = newTemperature <= 0;

  return {
    solution: {
      volume: newVolume,
      ph: newPh,
      temperature: Math.max(0, Math.min(100, newTemperature)),
      color: newColor,
      components: newComponents,
      hasGas,
      hasPrecipitate,
      precipitateColor,
      isBoiling,
      isFrozen,
    },
    reactions: matchingReactions,
  };
};

const calculatePH = (components: SolutionComponent[]): number => {
  if (components.length === 0) return 7;

  let totalHplus = 0;
  let totalOHminus = 0;
  let totalVolume = 0;

  for (const comp of components) {
    const reagent = getReagentById(comp.reagentId);
    if (!reagent) continue;

    const volumeLiters = comp.amount / reagent.concentration;
    totalVolume += volumeLiters;

    if (reagent.type === 'acid') {
      const strength = reagent.ph < 2 ? 1 : reagent.ph < 4 ? 0.5 : 0.1;
      totalHplus += comp.amount * strength;
    } else if (reagent.type === 'base') {
      const strength = reagent.ph > 12 ? 1 : reagent.ph > 10 ? 0.5 : 0.1;
      totalOHminus += comp.amount * strength;
    }
  }

  if (totalVolume === 0) return 7;

  const netHplus = (totalHplus - totalOHminus) / totalVolume;

  if (Math.abs(netHplus) < 0.0001) {
    return 7;
  } else if (netHplus > 0) {
    return Math.max(0, 7 - Math.log10(netHplus + 1e-8));
  } else {
    return Math.min(14, 7 + Math.log10(-netHplus + 1e-8));
  }
};

const calculateTemperature = (
  solution: Solution,
  newReagent: Reagent,
  volumeMl: number,
  reactions: Reaction[]
): number => {
  const newVolume = solution.volume + volumeMl;
  if (newVolume === 0) return 25;

  let heatChange = 0;

  for (const reaction of reactions) {
    for (const product of reaction.products) {
      if (product.type === 'heat') {
        heatChange += product.value * product.intensity;
      } else if (product.type === 'cool') {
        heatChange -= product.value * product.intensity;
      }
    }
  }

  const oldTempContribution = solution.temperature * solution.volume;
  const newTempContribution = newReagent.temperature * volumeMl;
  const mixedTemp = (oldTempContribution + newTempContribution) / newVolume;

  return mixedTemp + heatChange;
};

const calculateColor = (
  components: SolutionComponent[],
  ph: number
): string => {
  if (components.length === 0) return '#ffffff';

  const colors: { color: string; weight: number }[] = [];
  let indicatorInfo: { id: string; amount: number }[] = [];

  for (const comp of components) {
    const reagent = getReagentById(comp.reagentId);
    if (!reagent) continue;

    if (reagent.type === 'indicator') {
      indicatorInfo.push({ id: comp.reagentId, amount: comp.amount });
    } else {
      colors.push({ color: reagent.color, weight: comp.amount });
    }
  }

  let baseColor = mixColors(colors);

  for (const indicator of indicatorInfo) {
    baseColor = applyIndicatorColor(
      baseColor,
      ph,
      indicator.id,
      indicator.amount
    );
  }

  return baseColor;
};

export const stirSolution = (solution: Solution): Solution => {
  if (solution.components.length <= 1) return solution;

  const avgTemp = solution.temperature;
  const stabilizedTemp = avgTemp + (25 - avgTemp) * 0.05;

  return {
    ...solution,
    temperature: Math.max(0, Math.min(100, stabilizedTemp)),
  };
};

export const pourOutSolution = (
  solution: Solution,
  percentage: number = 0.5
): Solution => {
  if (percentage <= 0 || percentage >= 1) return createEmptySolution();

  const newVolume = solution.volume * (1 - percentage);
  const ratio = newVolume / solution.volume;

  return {
    ...solution,
    volume: newVolume,
    components: solution.components.map(c => ({
      ...c,
      amount: c.amount * ratio,
    })),
    hasPrecipitate: solution.hasPrecipitate && percentage < 0.8,
    hasGas: false,
  };
};

export const checkObjective = (
  solution: Solution,
  objective: {
    type: string;
    targetValue: any;
    tolerance: number;
  }
): { complete: boolean; progress: number } => {
  switch (objective.type) {
    case 'ph': {
      const diff = Math.abs(solution.ph - objective.targetValue);
      const complete = diff <= objective.tolerance;
      const progress = Math.max(0, 1 - diff / 7);
      return { complete, progress };
    }
    case 'color': {
      const targetRgb = hexToRgb(objective.targetValue);
      const currentRgb = hexToRgb(solution.color);
      const diff = Math.sqrt(
        Math.pow(targetRgb.r - currentRgb.r, 2) +
          Math.pow(targetRgb.g - currentRgb.g, 2) +
          Math.pow(targetRgb.b - currentRgb.b, 2)
      );
      const complete = diff <= objective.tolerance;
      const progress = Math.max(0, 1 - diff / 255);
      return { complete, progress };
    }
    case 'temperature': {
      const complete = solution.temperature >= objective.targetValue;
      const progress = Math.min(1, solution.temperature / objective.targetValue);
      return { complete, progress };
    }
    case 'precipitate': {
      const complete = solution.hasPrecipitate;
      const progress = complete ? 1 : 0;
      return { complete, progress };
    }
    case 'gas': {
      const complete = solution.hasGas;
      const progress = complete ? 1 : 0;
      return { complete, progress };
    }
    case 'neutralize': {
      const diff = Math.abs(solution.ph - 7);
      const complete = diff <= objective.tolerance;
      const progress = Math.max(0, 1 - diff / 7);
      return { complete, progress };
    }
    default:
      return { complete: false, progress: 0 };
  }
};
