import React from 'react';
import { Reagent } from '@/types';
import { getReagentById } from '@/data/reagents';
import { PixelPanel } from '../common/PixelPanel';
import { useAudio } from '@/hooks/useAudio';
import { AlertTriangle, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReagentRackProps {
  reagentIds: string[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, itemId: string) => void;
  onDragEnd: () => void;
  onClickAdd: (itemId: string) => void;
  dragVolume: number;
  setDragVolume: (v: number) => void;
}

const dangerColors = {
  low: 'bg-green-600',
  medium: 'bg-yellow-600',
  high: 'bg-red-600',
};

const typeColors = {
  acid: 'border-red-500',
  base: 'border-blue-500',
  salt: 'border-purple-500',
  indicator: 'border-pink-500',
  water: 'border-cyan-500',
};

const typeBgColors = {
  acid: 'bg-red-900/30',
  base: 'bg-blue-900/30',
  salt: 'bg-purple-900/30',
  indicator: 'bg-pink-900/30',
  water: 'bg-cyan-900/30',
};

export const ReagentRack: React.FC<ReagentRackProps> = ({
  reagentIds,
  onDragStart,
  onDragEnd,
  onClickAdd,
  dragVolume,
  setDragVolume,
}) => {
  const { playClick } = useAudio();
  const reagents = reagentIds.map(id => getReagentById(id)).filter(Boolean) as Reagent[];

  return (
    <PixelPanel title="试剂架" variant="wood" className="h-full">
      <div className="mb-4">
        <label className="font-pixel text-xs text-stone-300 block mb-2">
          添加剂量: {dragVolume} mL
        </label>
        <div className="flex gap-2">
          {[10, 20, 50, 100].map(vol => (
            <button
              key={vol}
              onClick={() => {
                playClick();
                setDragVolume(vol);
              }}
              className={cn(
                'flex-1 py-1 font-pixel text-xs border-2 border-black transition-all',
                dragVolume === vol
                  ? 'bg-indigo-600 text-white'
                  : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
              )}
            >
              {vol}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {reagents.map(reagent => (
          <div
            key={reagent.id}
            draggable
            onDragStart={e => onDragStart(e, reagent.id)}
            onDragEnd={onDragEnd}
            onClick={() => {
              playClick();
              onClickAdd(reagent.id);
            }}
            className={cn(
              'p-3 border-2 border-black cursor-grab active:cursor-grabbing',
              'hover:scale-[1.02] transition-all duration-150',
              'border-l-4',
              typeColors[reagent.type],
              typeBgColors[reagent.type]
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-12 border-2 border-black flex-shrink-0 relative overflow-hidden"
                style={{ background: '#1a1a2e' }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: '70%',
                    background: reagent.color,
                    borderTop: '1px solid rgba(255,255,255,0.3)',
                  }}
                />
                <Droplets className="absolute top-1 right-1 w-3 h-3 text-white/50" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-pixel text-sm text-white truncate">
                    {reagent.name}
                  </span>
                  {reagent.dangerLevel && reagent.dangerLevel !== 'low' && (
                    <AlertTriangle
                      className={cn(
                        'w-3 h-3 flex-shrink-0',
                        reagent.dangerLevel === 'high'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      )}
                    />
                  )}
                </div>
                <div className="font-pixel text-xs text-stone-400 mb-1">
                  {reagent.formula}
                </div>
                <div className="flex items-center gap-2 font-pixel text-xs">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-white',
                      dangerColors[reagent.dangerLevel || 'low']
                    )}
                  >
                    pH: {reagent.ph}
                  </span>
                  <span className="text-stone-500">
                    {reagent.temperature}°C
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-black">
        <p className="font-pixel text-xs text-stone-500 text-center">
          拖拽或点击添加试剂
        </p>
      </div>
    </PixelPanel>
  );
};
