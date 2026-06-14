import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Play, Beaker, Volume2, VolumeX, Settings } from 'lucide-react';
import { PixelButton } from '../common/PixelButton';
import { PixelPanel } from '../common/PixelPanel';
import { useAudio } from '@/hooks/useAudio';
import { LEVELS } from '@/data/levels';
import { loadProgress } from '@/logic/scoring';
import { useGameStore } from '@/store/gameStore';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const { enabled, volume, setEnabled, setVolume, playClick } = useAudio();
  const unlockedLevels = useGameStore(state => state.unlockedLevels);
  const setMode = useGameStore(state => state.setMode);

  const [showSettings, setShowSettings] = React.useState(false);
  const progress = React.useMemo(() => loadProgress(), []);

  const handleChallengeClick = () => {
    playClick();
    setMode('challenge');
    navigate('/challenge');
  };

  const handleFreeClick = () => {
    playClick();
    setMode('free');
    navigate('/free');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-stone-900 flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white opacity-30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <FlaskConical className="w-16 h-16 text-cyan-400 animate-bounce" />
          <Beaker className="w-16 h-16 text-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <h1 className="font-pixel text-4xl md:text-5xl text-white mb-2 tracking-wider">
          <span className="text-cyan-400">化学</span>
          <span className="text-pink-400">实验室</span>
        </h1>
        <p className="font-pixel text-xs text-stone-400 tracking-widest">
          CHEMISTRY LAB SIMULATOR
        </p>
      </div>

      <PixelPanel className="w-full max-w-md mb-8" variant="dark">
        <div className="flex flex-col gap-4">
          <PixelButton
            variant="primary"
            size="lg"
            icon={<Play className="w-5 h-5" />}
            onClick={handleChallengeClick}
          >
            挑战模式
          </PixelButton>
          <PixelButton
            variant="success"
            size="lg"
            icon={<Beaker className="w-5 h-5" />}
            onClick={handleFreeClick}
          >
            自由模式
          </PixelButton>
          <PixelButton
            variant="secondary"
            size="md"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => {
              playClick();
              setShowSettings(!showSettings);
            }}
          >
            设置
          </PixelButton>
        </div>
      </PixelPanel>

      {showSettings && (
        <PixelPanel className="w-full max-w-md mb-8" variant="dark">
          <h3 className="font-pixel text-sm text-white mb-4">音效设置</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="font-pixel text-xs text-stone-300">音效开关</span>
            <PixelButton
              variant={enabled ? 'success' : 'danger'}
              size="sm"
              icon={enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              onClick={() => {
                playClick();
                setEnabled(!enabled);
              }}
            >
              {enabled ? '开启' : '关闭'}
            </PixelButton>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-pixel text-xs text-stone-300 w-16">音量</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={e => setVolume(Number(e.target.value) / 100)}
              className="flex-1 h-2 bg-stone-700 rounded appearance-none cursor-pointer"
            />
            <span className="font-pixel text-xs text-cyan-400 w-12">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </PixelPanel>
      )}

      <div className="font-pixel text-xs text-stone-500 text-center">
        <p>已解锁关卡: {unlockedLevels.length} / {LEVELS.length}</p>
        <p className="mt-1">
          获得星星: {Object.values(progress).reduce((a, b) => a + b, 0)} / {LEVELS.length * 3}
        </p>
      </div>

      <div className="mt-8 font-pixel text-xs text-stone-600 text-center">
        <p>拖拽试剂到烧杯中进行实验</p>
        <p>观察反应现象，完成挑战目标！</p>
      </div>
    </div>
  );
};
