import React from 'react';
import { PixelButton } from '../common/PixelButton';
import { RotateCcw, Download, Trash2, ArrowLeft, HelpCircle } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

interface ToolbarProps {
  onStir: () => void;
  onPourOut: () => void;
  onReset: () => void;
  onExport?: () => void;
  onBack: () => void;
  onHint?: () => void;
  isFreeMode?: boolean;
  disabled?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onStir,
  onPourOut,
  onReset,
  onExport,
  onBack,
  onHint,
  isFreeMode = false,
  disabled = false,
}) => {
  const { playClick, playStir, playPour } = useAudio();

  const handleStir = () => {
    if (disabled) return;
    playClick();
    playStir();
    onStir();
  };

  const handlePourOut = () => {
    if (disabled) return;
    playClick();
    playPour();
    onPourOut();
  };

  const handleReset = () => {
    playClick();
    onReset();
  };

  const handleExport = () => {
    if (!onExport) return;
    playClick();
    onExport();
  };

  return (
    <div className="bg-stone-800 border-2 border-b-4 border-r-4 border-black p-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <PixelButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => {
            playClick();
            onBack();
          }}
        >
          返回
        </PixelButton>

        <div className="w-px h-8 bg-stone-600" />

        <PixelButton
          variant="primary"
          size="md"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={handleStir}
          disabled={disabled}
        >
          搅拌
        </PixelButton>

        <PixelButton
          variant="secondary"
          size="md"
          icon={<Download className="w-4 h-4" />}
          onClick={handlePourOut}
          disabled={disabled}
        >
          倒出一半
        </PixelButton>

        <PixelButton
          variant="danger"
          size="md"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={handleReset}
        >
          重置
        </PixelButton>

        {isFreeMode && onExport && (
          <>
            <div className="w-px h-8 bg-stone-600" />
            <PixelButton
              variant="success"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExport}
              disabled={disabled}
            >
              导出配方
            </PixelButton>
          </>
        )}

        {onHint && (
          <>
            <div className="w-px h-8 bg-stone-600" />
            <PixelButton
              variant="secondary"
              size="md"
              icon={<HelpCircle className="w-4 h-4" />}
              onClick={() => {
                playClick();
                onHint();
              }}
            >
              提示
            </PixelButton>
          </>
        )}
      </div>
    </div>
  );
};
