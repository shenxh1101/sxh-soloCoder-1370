import React, { useRef, useEffect } from 'react';
import { ExperimentLog as ExperimentLogType } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { 
  FlaskConical, 
  Zap, 
  Thermometer, 
  Wind, 
  Droplets, 
  Beaker, 
  RotateCcw,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExperimentLogProps {
  logs: ExperimentLogType[];
  onClear?: () => void;
}

const getLogIcon = (type: ExperimentLogType['type']) => {
  switch (type) {
    case 'add_reagent':
      return <Droplets className="w-4 h-4 text-blue-400" />;
    case 'reaction':
      return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'color_change':
      return <FlaskConical className="w-4 h-4 text-purple-400" />;
    case 'heat':
      return <Thermometer className="w-4 h-4 text-red-400" />;
    case 'gas':
      return <Wind className="w-4 h-4 text-cyan-400" />;
    case 'precipitate':
      return <Beaker className="w-4 h-4 text-stone-400" />;
    case 'stir':
      return <RotateCcw className="w-4 h-4 text-green-400" />;
    case 'pour_out':
      return <Droplets className="w-4 h-4 text-orange-400" />;
    case 'reset':
      return <Trash2 className="w-4 h-4 text-red-400" />;
    default:
      return <FlaskConical className="w-4 h-4 text-stone-400" />;
  }
};

const getLogBgColor = (type: ExperimentLogType['type']) => {
  switch (type) {
    case 'add_reagent':
      return 'bg-blue-900/30 border-blue-700';
    case 'reaction':
      return 'bg-yellow-900/30 border-yellow-700';
    case 'color_change':
      return 'bg-purple-900/30 border-purple-700';
    case 'heat':
      return 'bg-red-900/30 border-red-700';
    case 'gas':
      return 'bg-cyan-900/30 border-cyan-700';
    case 'precipitate':
      return 'bg-stone-800/50 border-stone-600';
    case 'stir':
      return 'bg-green-900/30 border-green-700';
    case 'pour_out':
      return 'bg-orange-900/30 border-orange-700';
    case 'reset':
      return 'bg-red-900/30 border-red-700';
    default:
      return 'bg-stone-800/50 border-stone-600';
  }
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
};

export const ExperimentLog: React.FC<ExperimentLogProps> = ({ logs, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <PixelPanel 
      title="实验记录" 
      variant="dark"
      className="flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-cyan-400" />
          <span className="font-pixel text-xs text-stone-300">
            共 {logs.length} 条记录
          </span>
        </div>
        {onClear && logs.length > 0 && (
          <button
            onClick={onClear}
            className="font-pixel text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            清空记录
          </button>
        )}
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-2 max-h-64 pr-1"
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FlaskConical className="w-12 h-12 text-stone-600 mb-3" />
            <p className="font-pixel text-xs text-stone-500">
              开始实验后，这里会记录每一步操作
            </p>
            <p className="font-pixel text-xs text-stone-600 mt-1">
              包括添加试剂、反应、颜色变化等
            </p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id}
              className={cn(
                'p-2 border-l-4 transition-all duration-300',
                getLogBgColor(log.type)
              )}
              style={{
                animation: logs.length > 1 && index === logs.length - 1 
                  ? 'slideIn 0.3s ease-out' 
                  : 'none'
              }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-xs text-white break-words">
                      {log.message}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-pixel text-[10px] text-stone-400">
                      {formatTime(log.timestamp)}
                    </span>
                    {log.details && log.details.formula && (
                      <span className="font-pixel text-[10px] text-cyan-400">
                        {log.details.formula}
                      </span>
                    )}
                    {log.details && log.details.volume && (
                      <span className="font-pixel text-[10px] text-blue-400">
                        {log.details.volume}mL
                      </span>
                    )}
                  </div>
                  {log.details && log.details.reactionId && (
                    <div className="mt-1">
                      <span className="font-pixel text-[10px] text-yellow-400">
                        {log.details.equation || log.details.reactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {logs.length > 5 && (
        <div className="flex items-center justify-center gap-1 pt-2 border-t border-stone-700 mt-2">
          <ChevronDown className="w-3 h-3 text-stone-500 animate-bounce" />
          <span className="font-pixel text-[10px] text-stone-500">
            滚动查看更多记录
          </span>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </PixelPanel>
  );
};
