export type ReagentType = 'acid' | 'base' | 'salt' | 'indicator' | 'water';

export interface Reagent {
  id: string;
  name: string;
  formula: string;
  type: ReagentType;
  color: string;
  ph: number;
  temperature: number;
  concentration: number;
  description: string;
  dangerLevel?: 'low' | 'medium' | 'high';
}

export interface SolutionComponent {
  reagentId: string;
  amount: number;
}

export interface Solution {
  volume: number;
  ph: number;
  temperature: number;
  color: string;
  components: SolutionComponent[];
  hasGas: boolean;
  hasPrecipitate: boolean;
  precipitateColor?: string;
  isBoiling: boolean;
  isFrozen: boolean;
}

export type ReactionProductType = 
  | 'colorChange' 
  | 'gas' 
  | 'precipitate' 
  | 'heat' 
  | 'cool' 
  | 'explosion'
  | 'neutralization';

export interface ReactionProduct {
  type: ReactionProductType;
  value: any;
  intensity: number;
}

export interface Reaction {
  id: string;
  reactants: { reagentId: string; minRatio: number }[];
  products: ReactionProduct[];
  description: string;
  equation?: string;
}

export type ObjectiveType = 'ph' | 'color' | 'temperature' | 'precipitate' | 'gas' | 'neutralize';

export interface LevelObjective {
  type: ObjectiveType;
  targetValue: any;
  tolerance: number;
  description: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  objective: LevelObjective;
  availableReagents: string[];
  maxSteps: number;
  starThresholds: { three: number; two: number; one: number };
  hint?: string;
}

export interface GameState {
  mode: 'menu' | 'challenge' | 'free';
  currentLevelId?: string;
  solution: Solution;
  steps: number;
  isComplete: boolean;
  score: number;
  stars: number;
  timeElapsed: number;
  reactions: string[];
  unlockedLevels: string[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'bubble' | 'precipitate' | 'spark';
}

export interface Recipe {
  name: string;
  reagents: { id: string; amount: number }[];
  result: string;
  createdAt: number;
}
