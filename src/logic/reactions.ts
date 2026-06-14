import { Reaction } from '../types';

export const REACTIONS: Reaction[] = [
  {
    id: 'acid-base-neutralization',
    reactants: [
      { reagentId: 'hcl', minRatio: 0.1 },
      { reagentId: 'naoh', minRatio: 0.1 },
    ],
    products: [
      { type: 'heat', value: 15, intensity: 1 },
      { type: 'neutralization', value: true, intensity: 1 },
    ],
    description: '盐酸与氢氧化钠中和反应，放热',
    equation: 'HCl + NaOH → NaCl + H₂O',
  },
  {
    id: 'h2so4-naoh-neutralization',
    reactants: [
      { reagentId: 'h2so4', minRatio: 0.1 },
      { reagentId: 'naoh', minRatio: 0.1 },
    ],
    products: [
      { type: 'heat', value: 20, intensity: 1.2 },
      { type: 'neutralization', value: true, intensity: 1 },
    ],
    description: '硫酸与氢氧化钠中和反应，剧烈放热',
    equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O',
  },
  {
    id: 'acetic-naoh-neutralization',
    reactants: [
      { reagentId: 'acetic', minRatio: 0.1 },
      { reagentId: 'naoh', minRatio: 0.1 },
    ],
    products: [
      { type: 'heat', value: 8, intensity: 0.8 },
      { type: 'neutralization', value: true, intensity: 1 },
    ],
    description: '醋酸与氢氧化钠中和反应',
    equation: 'CH₃COOH + NaOH → CH₃COONa + H₂O',
  },
  {
    id: 'hcl-ammonia-neutralization',
    reactants: [
      { reagentId: 'hcl', minRatio: 0.1 },
      { reagentId: 'ammonia', minRatio: 0.1 },
    ],
    products: [
      { type: 'heat', value: 10, intensity: 0.9 },
      { type: 'neutralization', value: true, intensity: 1 },
    ],
    description: '盐酸与氨水中和反应',
    equation: 'HCl + NH₃·H₂O → NH₄Cl + H₂O',
  },
  {
    id: 'acid-carbonate-gas',
    reactants: [
      { reagentId: 'hcl', minRatio: 0.1 },
      { reagentId: 'na2co3', minRatio: 0.1 },
    ],
    products: [
      { type: 'gas', value: 'CO₂', intensity: 1.5 },
      { type: 'heat', value: 5, intensity: 0.5 },
    ],
    description: '碳酸钠与盐酸反应产生二氧化碳气泡',
    equation: 'Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑',
  },
  {
    id: 'acid-bicarbonate-gas',
    reactants: [
      { reagentId: 'hcl', minRatio: 0.1 },
      { reagentId: 'nahco3', minRatio: 0.1 },
    ],
    products: [
      { type: 'gas', value: 'CO₂', intensity: 1.2 },
      { type: 'heat', value: 3, intensity: 0.3 },
    ],
    description: '碳酸氢钠与盐酸反应产生二氧化碳气泡',
    equation: 'NaHCO₃ + HCl → NaCl + H₂O + CO₂↑',
  },
  {
    id: 'acetic-carbonate-gas',
    reactants: [
      { reagentId: 'acetic', minRatio: 0.1 },
      { reagentId: 'na2co3', minRatio: 0.1 },
    ],
    products: [
      { type: 'gas', value: 'CO₂', intensity: 0.8 },
      { type: 'heat', value: 2, intensity: 0.2 },
    ],
    description: '醋酸与碳酸钠反应产生二氧化碳气泡',
    equation: 'Na₂CO₃ + 2CH₃COOH → 2CH₃COONa + H₂O + CO₂↑',
  },
  {
    id: 'acetic-bicarbonate-gas',
    reactants: [
      { reagentId: 'acetic', minRatio: 0.1 },
      { reagentId: 'nahco3', minRatio: 0.1 },
    ],
    products: [
      { type: 'gas', value: 'CO₂', intensity: 0.7 },
      { type: 'heat', value: 2, intensity: 0.2 },
    ],
    description: '醋酸与碳酸氢钠反应产生二氧化碳气泡',
    equation: 'NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑',
  },
  {
    id: 'silver-chloride-precipitate',
    reactants: [
      { reagentId: 'agno3', minRatio: 0.05 },
      { reagentId: 'nacl', minRatio: 0.05 },
    ],
    products: [
      { type: 'precipitate', value: { color: '#ffffff', name: 'AgCl' }, intensity: 1 },
    ],
    description: '硝酸银与氯化钠反应生成白色氯化银沉淀',
    equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
  },
  {
    id: 'silver-hydrochloride-precipitate',
    reactants: [
      { reagentId: 'agno3', minRatio: 0.05 },
      { reagentId: 'hcl', minRatio: 0.05 },
    ],
    products: [
      { type: 'precipitate', value: { color: '#ffffff', name: 'AgCl' }, intensity: 1 },
    ],
    description: '硝酸银与盐酸反应生成白色氯化银沉淀',
    equation: 'AgNO₃ + HCl → AgCl↓ + HNO₃',
  },
  {
    id: 'barium-sulfate-precipitate',
    reactants: [
      { reagentId: 'bacl2', minRatio: 0.05 },
      { reagentId: 'h2so4', minRatio: 0.05 },
    ],
    products: [
      { type: 'precipitate', value: { color: '#ffffff', name: 'BaSO₄' }, intensity: 1 },
    ],
    description: '氯化钡与硫酸反应生成白色硫酸钡沉淀',
    equation: 'BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl',
  },
  {
    id: 'copper-hydroxide-precipitate',
    reactants: [
      { reagentId: 'cuso4', minRatio: 0.05 },
      { reagentId: 'naoh', minRatio: 0.05 },
    ],
    products: [
      { type: 'precipitate', value: { color: '#2196f3', name: 'Cu(OH)₂' }, intensity: 1 },
    ],
    description: '硫酸铜与氢氧化钠反应生成蓝色氢氧化铜沉淀',
    equation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
  },
  {
    id: 'copper-ammonia-complex',
    reactants: [
      { reagentId: 'cuso4', minRatio: 0.05 },
      { reagentId: 'ammonia', minRatio: 0.1 },
    ],
    products: [
      { type: 'colorChange', value: '#3f51b5', intensity: 1 },
      { type: 'precipitate', value: { color: '#2196f3', name: 'Cu(OH)₂' }, intensity: 0.5 },
    ],
    description: '硫酸铜与过量氨水反应生成深蓝色铜氨络离子',
    equation: 'CuSO₄ + 4NH₃ → [Cu(NH₃)₄]SO₄',
  },
  {
    id: 'iron-hydroxide-precipitate',
    reactants: [
      { reagentId: 'fecl3', minRatio: 0.05 },
      { reagentId: 'naoh', minRatio: 0.05 },
    ],
    products: [
      { type: 'precipitate', value: { color: '#795548', name: 'Fe(OH)₃' }, intensity: 1 },
    ],
    description: '氯化铁与氢氧化钠反应生成红褐色氢氧化铁沉淀',
    equation: 'FeCl₃ + 3NaOH → Fe(OH)₃↓ + 3NaCl',
  },
  {
    id: 'calcium-carbonate-precipitate',
    reactants: [
      { reagentId: 'na2co3', minRatio: 0.05 },
      { reagentId: 'cacl2', minRatio: 0.05 },
    ],
    products: [
      { type: 'precipitate', value: { color: '#ffffff', name: 'CaCO₃' }, intensity: 1 },
    ],
    description: '碳酸钠与氯化钙反应生成白色碳酸钙沉淀',
    equation: 'Na₂CO₃ + CaCl₂ → CaCO₃↓ + 2NaCl',
  },
  {
    id: 'h2so4-water-heat',
    reactants: [
      { reagentId: 'h2so4', minRatio: 0.1 },
      { reagentId: 'water', minRatio: 0.1 },
    ],
    products: [
      { type: 'heat', value: 30, intensity: 2 },
    ],
    description: '浓硫酸溶于水剧烈放热',
    equation: 'H₂SO₄ + H₂O → 大量热',
  },
  {
    id: 'naoh-water-heat',
    reactants: [
      { reagentId: 'naoh', minRatio: 0.1 },
      { reagentId: 'water', minRatio: 0.1 },
    ],
    products: [
      { type: 'heat', value: 15, intensity: 1.2 },
    ],
    description: '氢氧化钠溶于水放热',
    equation: 'NaOH + H₂O → Na⁺ + OH⁻ + 热',
  },
];

export const findMatchingReactions = (componentIds: string[]): Reaction[] => {
  return REACTIONS.filter(reaction => {
    return reaction.reactants.every(reactant => {
      return componentIds.includes(reactant.reagentId);
    });
  });
};
