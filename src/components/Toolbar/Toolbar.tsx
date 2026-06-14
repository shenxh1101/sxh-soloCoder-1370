import React, { useRef } from 'react';
import { PixelButton } from '../common/PixelButton';
import { RotateCcw, Download, Trash2, ArrowLeft, HelpCircle, Upload } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { Recipe } from '@/types';

interface ToolbarProps {
  onStir: () => void;
  onPourOut: () => void;
  onReset: () => void;
  onExport?: () => void;
  onImport?: (recipe: Recipe) => { success: boolean; error?: string };
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
  onImport,
  onBack,
  onHint,
  isFreeMode = false,
  disabled = false,
}) => {
  const { playClick, playStir, playPour, playSuccess, playFail } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => {
    if (!onImport || disabled) return;
    playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const recipe = JSON.parse(event.target?.result as string) as Recipe;
        const result = onImport(recipe);
        
        if (result.success) {
          playSuccess();
          alert('✅ 配方导入成功！');
        } else {
          playFail();
          alert('❌ 导入失败：' + (result.error || '未知错误'));
        }
      } catch (error) {
        playFail();
        alert('❌ 导入失败：无效的JSON文件');
      }
    };
    
    reader.onerror = () => {
      playFail();
      alert('❌ 文件读取失败');
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-stone-800 border-2 border-b-4 border-r-4 border-black p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
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

        {isFreeMode && (
          <>
            <div className="w-px h-8 bg-stone-600" />
            {onImport && (
              <PixelButton
                variant="secondary"
                size="md"
                icon={<Upload className="w-4 h-4" />}
                onClick={handleImportClick}
                disabled={disabled}
              >
                导入配方
              </PixelButton>
            )}
            {onExport && (
              <PixelButton
                variant="success"
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={handleExport}
                disabled={disabled}
              >
                导出配方
              </PixelButton>
            )}
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
