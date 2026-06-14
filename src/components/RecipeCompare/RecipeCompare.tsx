import React, { useMemo } from 'react';
import { SavedRecipe, Solution, RecipeCompareData } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { PixelButton } from '../common/PixelButton';
import { 
  ArrowRightLeft, 
  X, 
  Check, 
  Wind,
  Sparkles,
  Thermometer,
  Beaker,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getReagentById } from '@/data/reagents';

interface RecipeCompareProps {
  leftName: string;
  leftSolution: Solution;
  leftSteps: number;
  rightRecipe: SavedRecipe;
  onClose: () => void;
  onLoadRight?: () => void;
}

export const RecipeCompare: React.FC<RecipeCompareProps> = ({
  leftName,
  leftSolution,
  leftSteps,
  rightRecipe,
  onClose,
  onLoadRight,
}) => {
  const buildCompareData = (
    name: string,
    solution: Solution | SavedRecipe['result'],
    steps: number,
    components: { reagentId: string; amount: number }[]
  ): RecipeCompareData => {
    const reagents = components.map(c => {
      const r = getReagentById(c.reagentId);
      return {
        id: c.reagentId,
        name: r?.name || c.reagentId,
        amount: c.amount,
        formula: r?.formula || '',
      };
    });

    if ('components' in solution) {
      return {
        name,
        ph: solution.ph,
        temperature: solution.temperature,
        color: solution.color,
        hasGas: solution.hasGas,
        hasPrecipitate: solution.hasPrecipitate,
        volume: solution.volume,
        steps,
        reagents,
      };
    }

    return {
      name,
      ph: solution.ph,
      temperature: solution.temperature,
      color: solution.color,
      hasGas: solution.hasGas,
      hasPrecipitate: solution.hasPrecipitate,
      volume: solution.volume,
      steps,
      reagents,
    };
  };

  const leftData = useMemo(() => 
    buildCompareData(leftName, leftSolution, leftSteps, 
      leftSolution.components.map(c => ({ reagentId: c.reagentId, amount: c.amount }))),
    [leftName, leftSolution, leftSteps]
  );

  const rightData = useMemo(() => 
    buildCompareData(rightRecipe.name, rightRecipe.result, rightRecipe.steps, 
      rightRecipe.reagents.map(r => ({ reagentId: r.id, amount: r.amount }))),
    [rightRecipe]
  );

  const diffNumber = (left: number, right: number, tolerance = 0.1) => {
    const diff = left - right;
    if (Math.abs(diff) < tolerance) return { type: 'same', diff: 0 };
    return diff > 0 
      ? { type: 'higher', diff } 
      : { type: 'lower', diff };
  };

  const diffBoolean = (left: boolean, right: boolean) => {
    if (left === right) return 'same';
    return left ? 'only-left' : 'only-right';
  };

  const DiffBadge = ({ type, suffix = '' }: { type: string; suffix?: string }) => {
    if (type === 'same') {
      return (
        <span className="inline-flex items-center gap-1 font-pixel text-[10px] text-green-400">
          <Check className="w-3 h-3" /> 相同
        </span>
      );
    }
    if (type === 'higher') {
      return (
        <span className="inline-flex items-center gap-1 font-pixel text-[10px] text-orange-400">
          <ArrowUp className="w-3 h-3" /> 偏高 {suffix}
        </span>
      );
    }
    if (type === 'lower') {
      return (
        <span className="inline-flex items-center gap-1 font-pixel text-[10px] text-blue-400">
          <ArrowDown className="w-3 h-3" /> 偏低 {suffix}
        </span>
      );
    }
    if (type === 'only-left') {
      return (
        <span className="inline-flex items-center gap-1 font-pixel text-[10px] text-yellow-400">
          <Minus className="w-3 h-3" /> 仅左侧有
        </span>
      );
    }
    if (type === 'only-right') {
      return (
        <span className="inline-flex items-center gap-1 font-pixel text-[10px] text-purple-400">
          <Minus className="w-3 h-3" /> 仅右侧有
        </span>
      );
    }
    return null;
  };

  const phDiff = diffNumber(leftData.ph, rightData.ph, 0.5);
  const tempDiff = diffNumber(leftData.temperature, rightData.temperature, 1);
  const volumeDiff = diffNumber(leftData.volume, rightData.volume, 1);
  const stepsDiff = diffNumber(leftData.steps, rightData.steps, 0);
  const gasDiff = diffBoolean(leftData.hasGas, rightData.hasGas);
  const precipitateDiff = diffBoolean(leftData.hasPrecipitate, rightData.hasPrecipitate);

  const allReagentIds = Array.from(new Set([
    ...leftData.reagents.map(r => r.id),
    ...rightData.reagents.map(r => r.id),
  ]));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <PixelPanel variant="dark" className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
              <h2 className="font-pixel text-lg text-white">配方对比</h2>
            </div>
            <PixelButton
              variant="danger"
              size="sm"
              icon={<X className="w-4 h-4" />}
              onClick={onClose}
            >
              关闭
            </PixelButton>
          </div>

          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-3 bg-cyan-900/30 p-4 border-2 border-cyan-600">
              <div className="text-center">
                <div className="font-pixel text-xs text-cyan-400 mb-1">当前实验</div>
                <div className="font-pixel text-sm text-white truncate">{leftName}</div>
              </div>
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-stone-500" />
            </div>
            <div className="col-span-3 bg-amber-900/30 p-4 border-2 border-amber-600">
              <div className="text-center">
                <div className="font-pixel text-xs text-amber-400 mb-1">保存的配方</div>
                <div className="font-pixel text-sm text-white truncate">{rightData.name}</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-pixel text-sm text-stone-400 border-b border-stone-700 pb-2">
              🔬 结果参数对比
            </h3>

            <div className="grid grid-cols-7 gap-2 items-center p-3 bg-stone-800 border-2 border-stone-700">
              <div className="col-span-3 text-right">
                <span className="font-pixel text-xs text-cyan-300">pH {leftData.ph.toFixed(2)}</span>
              </div>
              <div className="col-span-1 text-center">
                <DiffBadge type={phDiff.type} suffix={Math.abs(phDiff.diff).toFixed(2)} />
              </div>
              <div className="col-span-3 text-left">
                <span className="font-pixel text-xs text-amber-300">pH {rightData.ph.toFixed(2)}</span>
              </div>
              <div className="col-span-7 text-center mt-1">
                <span className="font-pixel text-[10px] text-stone-500">酸碱度 (pH值)</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 items-center p-3 bg-stone-800 border-2 border-stone-700">
              <div className="col-span-3 text-right">
                <span className="font-pixel text-xs text-cyan-300">{leftData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="col-span-1 text-center">
                <DiffBadge type={tempDiff.type} suffix={`${Math.abs(tempDiff.diff).toFixed(1)}°C`} />
              </div>
              <div className="col-span-3 text-left">
                <span className="font-pixel text-xs text-amber-300">{rightData.temperature.toFixed(1)}°C</span>
              </div>
              <div className="col-span-7 text-center mt-1">
                <span className="font-pixel text-[10px] text-stone-500">
                  <Thermometer className="w-3 h-3 inline" /> 温度
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 items-center p-3 bg-stone-800 border-2 border-stone-700">
              <div className="col-span-3 flex items-center justify-end gap-2">
                <div 
                  className="w-8 h-8 border-2 border-stone-600"
                  style={{ backgroundColor: leftData.color }}
                />
                <span className="font-pixel text-[10px] text-stone-400">{leftData.color}</span>
              </div>
              <div className="col-span-1 text-center">
                <div className="flex items-center justify-center gap-0.5">
                  <div 
                    className="w-4 h-4 border border-stone-600"
                    style={{ backgroundColor: leftData.color }}
                  />
                  <span className="text-stone-500">→</span>
                  <div 
                    className="w-4 h-4 border border-stone-600"
                    style={{ backgroundColor: rightData.color }}
                  />
                </div>
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <div 
                  className="w-8 h-8 border-2 border-stone-600"
                  style={{ backgroundColor: rightData.color }}
                />
                <span className="font-pixel text-[10px] text-stone-400">{rightData.color}</span>
              </div>
              <div className="col-span-7 text-center mt-1">
                <span className="font-pixel text-[10px] text-stone-500">溶液颜色</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-800 border-2 border-stone-700 space-y-2">
                <div className="font-pixel text-[10px] text-stone-500 text-center mb-2">
                  💨 气体生成
                </div>
                <div className="grid grid-cols-7 gap-2 items-center">
                  <div className="col-span-3 text-right">
                    {leftData.hasGas 
                      ? <span className="font-pixel text-xs text-cyan-400 flex items-center justify-end gap-1"><Wind className="w-3 h-3" />有</span>
                      : <span className="font-pixel text-xs text-stone-500">无</span>
                    }
                  </div>
                  <div className="col-span-1 text-center">
                    <DiffBadge type={gasDiff} />
                  </div>
                  <div className="col-span-3 text-left">
                    {rightData.hasGas 
                      ? <span className="font-pixel text-xs text-amber-400 flex items-center gap-1"><Wind className="w-3 h-3" />有</span>
                      : <span className="font-pixel text-xs text-stone-500">无</span>
                    }
                  </div>
                </div>
              </div>

              <div className="p-3 bg-stone-800 border-2 border-stone-700 space-y-2">
                <div className="font-pixel text-[10px] text-stone-500 text-center mb-2">
                  🔬 沉淀生成
                </div>
                <div className="grid grid-cols-7 gap-2 items-center">
                  <div className="col-span-3 text-right">
                    {leftData.hasPrecipitate 
                      ? <span className="font-pixel text-xs text-cyan-400 flex items-center justify-end gap-1"><Sparkles className="w-3 h-3" />有</span>
                      : <span className="font-pixel text-xs text-stone-500">无</span>
                    }
                  </div>
                  <div className="col-span-1 text-center">
                    <DiffBadge type={precipitateDiff} />
                  </div>
                  <div className="col-span-3 text-left">
                    {rightData.hasPrecipitate 
                      ? <span className="font-pixel text-xs text-amber-400 flex items-center gap-1"><Sparkles className="w-3 h-3" />有</span>
                      : <span className="font-pixel text-xs text-stone-500">无</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-stone-800 border-2 border-stone-700">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-right">
                    <span className="font-pixel text-xs text-cyan-300">{leftData.volume.toFixed(0)}mL</span>
                  </div>
                  <div className="text-center">
                    <DiffBadge type={volumeDiff.type} suffix={`${Math.abs(volumeDiff.diff).toFixed(0)}mL`} />
                  </div>
                  <div className="text-left">
                    <span className="font-pixel text-xs text-amber-300">{rightData.volume.toFixed(0)}mL</span>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <span className="font-pixel text-[10px] text-stone-500">
                    <Beaker className="w-3 h-3 inline" /> 体积
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-800 border-2 border-stone-700">
                <div className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-right">
                    <span className="font-pixel text-xs text-cyan-300">{leftData.steps}步</span>
                  </div>
                  <div className="text-center">
                    <DiffBadge type={stepsDiff.type} suffix={`${Math.abs(stepsDiff.diff)}步`} />
                  </div>
                  <div className="text-left">
                    <span className="font-pixel text-xs text-amber-300">{rightData.steps}步</span>
                  </div>
                </div>
                <div className="text-center mt-1">
                  <span className="font-pixel text-[10px] text-stone-500">操作步数</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-pixel text-sm text-stone-400 border-b border-stone-700 pb-2">
              🧪 试剂组成对比
            </h3>

            <div className="space-y-2">
              {allReagentIds.map(id => {
                const leftReagent = leftData.reagents.find(r => r.id === id);
                const rightReagent = rightData.reagents.find(r => r.id === id);
                const leftAmount = leftReagent?.amount || 0;
                const rightAmount = rightReagent?.amount || 0;
                const reagentDiff = diffNumber(leftAmount, rightAmount, 0.0001);
                const reagentName = leftReagent?.name || rightReagent?.name || id;
                const reagentFormula = leftReagent?.formula || rightReagent?.formula || '';

                return (
                  <div 
                    key={id}
                    className="grid grid-cols-7 gap-2 items-center p-3 bg-stone-800 border-2 border-stone-700"
                  >
                    <div className="col-span-3 text-right space-y-0.5">
                      <div className="font-pixel text-xs text-cyan-300">
                        {leftReagent ? `${(leftAmount * 1000).toFixed(1)} mmol` : '—'}
                      </div>
                    </div>
                    <div className="col-span-1 text-center">
                      {leftReagent && rightReagent ? (
                        <DiffBadge type={reagentDiff.type} suffix={`${Math.abs(reagentDiff.diff * 1000).toFixed(1)} mmol`} />
                      ) : (
                        <span className={cn(
                          'inline-flex items-center gap-1 font-pixel text-[10px]',
                          leftReagent ? 'text-yellow-400' : 'text-purple-400'
                        )}>
                          <Minus className="w-3 h-3" /> {leftReagent ? '仅左侧' : '仅右侧'}
                        </span>
                      )}
                    </div>
                    <div className="col-span-3 text-left space-y-0.5">
                      <div className="font-pixel text-xs text-amber-300">
                        {rightReagent ? `${(rightAmount * 1000).toFixed(1)} mmol` : '—'}
                      </div>
                    </div>
                    <div className="col-span-7 text-center mt-1 pt-1 border-t border-stone-700">
                      <span className="font-pixel text-[10px] text-stone-400">
                        {reagentName}
                        {reagentFormula && (
                          <span className="text-cyan-500 ml-2">({reagentFormula})</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-stone-700">
            {onLoadRight && (
              <PixelButton
                variant="primary"
                size="sm"
                onClick={onLoadRight}
              >
                载入右侧配方
              </PixelButton>
            )}
            <PixelButton
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              关闭对比
            </PixelButton>
          </div>
        </div>
      </PixelPanel>
    </div>
  );
};
