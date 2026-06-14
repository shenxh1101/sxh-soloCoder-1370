import React from 'react';
import { Solution } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { getPhColor } from '@/utils/colorMix';
import { Thermometer, Droplets, Ruler, Clock, Footprints } from 'lucide-react';

interface StatusPanelProps {
  solution: Solution;
  timeElapsed: number;
  steps: number;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const StatusPanel: React.FC<StatusPanelProps> = ({
  solution,
  timeElapsed,
  steps,
}) => {
  const phColor = getPhColor(solution.ph);

  return (
    <PixelPanel title="溶液状态" variant="dark">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-800 p-3 border-2 border-black">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full border-2 border-black"
                style={{ backgroundColor: phColor }}
              />
              <span className="font-pixel text-xs text-stone-400">pH值</span>
            </div>
            <div className="font-pixel text-2xl text-white">
              {solution.ph.toFixed(2)}
            </div>
            <div className="w-full h-2 bg-stone-700 mt-2 relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                style={{
                  width: `${(solution.ph / 14) * 100}%`,
                  backgroundColor: phColor,
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white"
                style={{ left: '50%' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-pixel text-xs text-red-400">酸</span>
              <span className="font-pixel text-xs text-blue-400">碱</span>
            </div>
          </div>

          <div className="bg-stone-800 p-3 border-2 border-black">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-orange-400" />
              <span className="font-pixel text-xs text-stone-400">温度</span>
            </div>
            <div className="font-pixel text-2xl text-white">
              {solution.temperature.toFixed(1)}
              <span className="text-sm">°C</span>
            </div>
            <div className="w-full h-2 bg-stone-700 mt-2 relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                style={{
                  width: `${Math.min(100, solution.temperature)}%`,
                  backgroundColor:
                    solution.temperature > 60
                      ? '#ef4444'
                      : solution.temperature < 10
                      ? '#3b82f6'
                      : '#22c55e',
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-pixel text-xs text-blue-400">0°</span>
              <span className="font-pixel text-xs text-red-400">100°</span>
            </div>
          </div>

          <div className="bg-stone-800 p-3 border-2 border-black">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <span className="font-pixel text-xs text-stone-400">体积</span>
            </div>
            <div className="font-pixel text-2xl text-white">
              {solution.volume.toFixed(0)}
              <span className="text-sm">mL</span>
            </div>
          </div>

          <div className="bg-stone-800 p-3 border-2 border-black">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-purple-400" />
              <span className="font-pixel text-xs text-stone-400">颜色</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 border-2 border-black"
                style={{ backgroundColor: solution.color }}
              />
              <span className="font-pixel text-xs text-stone-400 font-mono">
                {solution.color.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-3 border-t-2 border-stone-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="font-pixel text-xs text-white">
              时间: {formatTime(timeElapsed)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-green-400" />
            <span className="font-pixel text-xs text-white">
              步骤: {steps}
            </span>
          </div>
        </div>

        {(solution.hasGas || solution.hasPrecipitate || solution.isBoiling || solution.isFrozen) && (
          <div className="pt-3 border-t-2 border-stone-700 space-y-2">
            <h4 className="font-pixel text-xs text-stone-400">反应现象:</h4>
            <div className="flex flex-wrap gap-2">
              {solution.hasGas && (
                <span className="px-2 py-1 bg-cyan-900 text-cyan-300 font-pixel text-xs border-2 border-black">
                  💨 产生气体
                </span>
              )}
              {solution.hasPrecipitate && (
                <span className="px-2 py-1 bg-amber-900 text-amber-300 font-pixel text-xs border-2 border-black">
                  ⬇️ 生成沉淀
                </span>
              )}
              {solution.isBoiling && (
                <span className="px-2 py-1 bg-red-900 text-red-300 font-pixel text-xs border-2 border-black">
                  🔥 沸腾
                </span>
              )}
              {solution.isFrozen && (
                <span className="px-2 py-1 bg-blue-900 text-blue-300 font-pixel text-xs border-2 border-black">
                  ❄️ 冻结
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </PixelPanel>
  );
};
