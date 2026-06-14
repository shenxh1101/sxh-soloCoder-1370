import React, { useState, useCallback } from 'react';
import { SavedRecipe } from '@/types';
import { PixelPanel } from '../common/PixelPanel';
import { PixelButton } from '../common/PixelButton';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Download,
  Beaker,
  X,
  Check,
  Clock,
  Thermometer,
  Wind,
  Sparkles,
  ArrowRightLeft,
  PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate, convertRecipeToImportFormat } from '@/utils/recipeLibrary';
import { useAudio } from '@/hooks/useAudio';

interface RecipeLibraryProps {
  recipes: SavedRecipe[];
  currentSolutionComponents: { reagentId: string; amount: number }[];
  onRefresh: () => void;
  onLoadRecipe: (recipeId: string) => { success: boolean; error?: string };
  onSaveRecipe: (name: string, notes?: string) => SavedRecipe | null;
  onRenameRecipe: (recipeId: string, newName: string) => SavedRecipe | null;
  onDeleteRecipe: (recipeId: string) => boolean;
  onStartReplay?: () => void;
  onStartCompare?: () => void;
  onClose?: () => void;
  compareMode?: boolean;
  onSelectForCompare?: (recipe: SavedRecipe) => void;
}

export const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  recipes,
  currentSolutionComponents,
  onRefresh,
  onLoadRecipe,
  onSaveRecipe,
  onRenameRecipe,
  onDeleteRecipe,
  onStartReplay,
  onStartCompare,
  onClose,
  compareMode = false,
  onSelectForCompare,
}) => {
  const { playClick, playSuccess, playFail } = useAudio();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saveName, setSaveName] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hasCurrentExperiment = currentSolutionComponents.length > 0;

  const handleSave = useCallback(() => {
    if (!saveName.trim()) {
      alert('请输入配方名称');
      return;
    }
    playClick();
    const result = onSaveRecipe(saveName.trim(), saveNotes.trim() || undefined);
    if (result) {
      playSuccess();
      setShowSaveModal(false);
      setSaveName('');
      setSaveNotes('');
      onRefresh();
      alert('✅ 配方已保存！');
    } else {
      playFail();
      alert('❌ 保存失败：请先做实验再保存');
    }
  }, [saveName, saveNotes, onSaveRecipe, onRefresh, playClick, playSuccess, playFail]);

  const handleLoad = useCallback((recipe: SavedRecipe) => {
    playClick();
    const result = onLoadRecipe(recipe.id);
    if (result.success) {
      playSuccess();
      alert(`✅ 已载入配方：${recipe.name}`);
      onRefresh();
    } else {
      playFail();
      alert('❌ 载入失败：' + (result.error || '未知错误'));
    }
  }, [onLoadRecipe, onRefresh, playClick, playSuccess, playFail]);

  const handleStartRename = useCallback((recipe: SavedRecipe) => {
    playClick();
    setEditingId(recipe.id);
    setEditingName(recipe.name);
  }, [playClick]);

  const handleSaveRename = useCallback(() => {
    if (!editingId || !editingName.trim()) return;
    playClick();
    const result = onRenameRecipe(editingId, editingName.trim());
    if (result) {
      playSuccess();
      setEditingId(null);
      setEditingName('');
      onRefresh();
    } else {
      playFail();
    }
  }, [editingId, editingName, onRenameRecipe, onRefresh, playClick, playSuccess, playFail]);

  const handleCancelRename = useCallback(() => {
    playClick();
    setEditingId(null);
    setEditingName('');
  }, [playClick]);

  const handleDelete = useCallback((recipe: SavedRecipe) => {
    if (!confirm(`确定要删除配方「${recipe.name}」吗？`)) return;
    playClick();
    const result = onDeleteRecipe(recipe.id);
    if (result) {
      playSuccess();
      onRefresh();
      if (selectedId === recipe.id) setSelectedId(null);
    } else {
      playFail();
    }
  }, [onDeleteRecipe, onRefresh, selectedId, playClick, playSuccess, playFail]);

  const handleExportJson = useCallback((recipe: SavedRecipe) => {
    playClick();
    const json = convertRecipeToImportFormat(recipe);
    const dataStr = JSON.stringify(json, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.name || 'recipe'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    playSuccess();
  }, [playClick, playSuccess]);

  return (
    <PixelPanel 
      title={compareMode ? "选择对比配方" : "配方库"}
      variant="dark"
      className="h-full flex flex-col"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-yellow-400" />
          <span className="font-pixel text-xs text-stone-300">
            共 {recipes.length} 个配方
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!compareMode && (
            <>
              <PixelButton
                variant="success"
                size="sm"
                icon={<Save className="w-3 h-3" />}
                onClick={() => { playClick(); setShowSaveModal(true); }}
                disabled={!hasCurrentExperiment}
              >
                保存当前
              </PixelButton>
              
              {hasCurrentExperiment && onStartReplay && (
                <PixelButton
                  variant="secondary"
                  size="sm"
                  icon={<PlayCircle className="w-3 h-3" />}
                  onClick={() => { playClick(); onStartReplay(); }}
                >
                  回放
                </PixelButton>
              )}
              
              {hasCurrentExperiment && recipes.length > 0 && onStartCompare && (
                <PixelButton
                  variant="primary"
                  size="sm"
                  icon={<ArrowRightLeft className="w-3 h-3" />}
                  onClick={() => { playClick(); onStartCompare(); }}
                >
                  对比
                </PixelButton>
              )}
            </>
          )}
          
          {onClose && (
            <PixelButton
              variant="danger"
              size="sm"
              icon={<X className="w-3 h-3" />}
              onClick={onClose}
            >
              关闭
            </PixelButton>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 max-h-80 pr-1">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Beaker className="w-16 h-16 text-stone-600 mb-4" />
            <p className="font-pixel text-xs text-stone-500 mb-1">
              配方库是空的
            </p>
            <p className="font-pixel text-xs text-stone-600">
              做完实验后点击「保存当前」
            </p>
          </div>
        ) : (
          recipes.slice().sort((a, b) => b.updatedAt - a.updatedAt).map(recipe => (
            <div
              key={recipe.id}
              className={cn(
                'border-2 transition-all p-3',
                selectedId === recipe.id
                  ? 'bg-cyan-900/50 border-cyan-500'
                  : 'bg-stone-800 border-stone-600 hover:border-stone-500',
                compareMode && 'cursor-pointer'
              )}
              onClick={() => {
                if (compareMode) {
                  setSelectedId(recipe.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                {editingId === recipe.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 font-pixel text-xs bg-stone-900 text-white px-2 py-1 border-2 border-cyan-500 outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename();
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveRename(); }}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCancelRename(); }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-pixel text-sm text-white truncate">
                        {recipe.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-stone-500" />
                        <span className="font-pixel text-[10px] text-stone-500">
                          {formatDate(recipe.updatedAt)}
                        </span>
                        <span className="font-pixel text-[10px] text-cyan-500">
                          {recipe.steps}步
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <div className="bg-stone-900 p-2 border border-stone-700">
                  <span className="font-pixel text-[10px] text-stone-500 block">pH</span>
                  <span className="font-pixel text-xs text-cyan-400">{recipe.result.ph.toFixed(1)}</span>
                </div>
                <div className="bg-stone-900 p-2 border border-stone-700">
                  <span className="font-pixel text-[10px] text-stone-500 block">温度</span>
                  <span className="font-pixel text-xs text-orange-400">{recipe.result.temperature.toFixed(0)}°C</span>
                </div>
                <div className="bg-stone-900 p-2 border border-stone-700 flex items-center gap-1">
                  <div 
                    className="w-4 h-4 border-2 border-stone-600"
                    style={{ backgroundColor: recipe.result.color }}
                  />
                  <span className="font-pixel text-[10px] text-stone-400">颜色</span>
                </div>
                <div className="bg-stone-900 p-2 border border-stone-700 flex items-center gap-1">
                  {recipe.result.hasGas && <span title="有气体"><Wind className="w-3 h-3 text-cyan-400" /></span>}
                  {recipe.result.hasPrecipitate && <span title="有沉淀"><Sparkles className="w-3 h-3 text-stone-400" /></span>}
                  {!recipe.result.hasGas && !recipe.result.hasPrecipitate && (
                    <Thermometer className="w-3 h-3 text-stone-600" />
                  )}
                  <span className="font-pixel text-[10px] text-stone-400">
                    {recipe.result.hasGas ? '气体' : recipe.result.hasPrecipitate ? '沉淀' : '无'}
                  </span>
                </div>
              </div>

              {recipe.notes && (
                <div className="bg-amber-900/30 p-2 border border-amber-700 mb-2">
                  <span className="font-pixel text-[10px] text-amber-300">
                    📝 {recipe.notes}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-700">
                {!compareMode && (
                  <>
                    <PixelButton
                      variant="primary"
                      size="sm"
                      icon={<FolderOpen className="w-3 h-3" />}
                      onClick={(e) => { e.stopPropagation(); handleLoad(recipe); }}
                    >
                      载入
                    </PixelButton>
                    <PixelButton
                      variant="secondary"
                      size="sm"
                      icon={<Edit3 className="w-3 h-3" />}
                      onClick={(e) => { e.stopPropagation(); handleStartRename(recipe); }}
                    >
                      重命名
                    </PixelButton>
                    <PixelButton
                      variant="secondary"
                      size="sm"
                      icon={<Download className="w-3 h-3" />}
                      onClick={(e) => { e.stopPropagation(); handleExportJson(recipe); }}
                    >
                      导出
                    </PixelButton>
                    <PixelButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3 h-3" />}
                      onClick={(e) => { e.stopPropagation(); handleDelete(recipe); }}
                    >
                      删除
                    </PixelButton>
                  </>
                )}
                
                {compareMode && onSelectForCompare && selectedId === recipe.id && (
                  <PixelButton
                    variant="success"
                    size="sm"
                    icon={<Check className="w-3 h-3" />}
                    onClick={(e) => { e.stopPropagation(); onSelectForCompare(recipe); }}
                  >
                    选择对比
                  </PixelButton>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <PixelPanel variant="dark" className="max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-lg text-white">保存配方</h3>
                <button
                  onClick={() => { playClick(); setShowSaveModal(false); setSaveName(''); setSaveNotes(''); }}
                  className="p-1 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div>
                <label className="font-pixel text-xs text-stone-400 block mb-1">
                  配方名称 *
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="例如：中和反应实验"
                  className="w-full font-pixel text-xs bg-stone-900 text-white px-3 py-2 border-2 border-stone-600 focus:border-cyan-500 outline-none"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="font-pixel text-xs text-stone-400 block mb-1">
                  备注（可选）
                </label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="实验心得、注意事项..."
                  rows={3}
                  className="w-full font-pixel text-xs bg-stone-900 text-white px-3 py-2 border-2 border-stone-600 focus:border-cyan-500 outline-none resize-none"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={() => { playClick(); setShowSaveModal(false); setSaveName(''); setSaveNotes(''); }}
                >
                  取消
                </PixelButton>
                <PixelButton
                  variant="success"
                  size="sm"
                  icon={<Plus className="w-3 h-3" />}
                  onClick={handleSave}
                >
                  保存
                </PixelButton>
              </div>
            </div>
          </PixelPanel>
        </div>
      )}
    </PixelPanel>
  );
};
