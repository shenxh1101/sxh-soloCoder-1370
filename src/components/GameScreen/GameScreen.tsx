import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Beaker } from '../Beaker/Beaker';
import { ReagentRack } from '../ReagentRack/ReagentRack';
import { StatusPanel } from '../StatusPanel/StatusPanel';
import { Toolbar } from '../Toolbar/Toolbar';
import { ObjectivePanel } from '../ObjectivePanel/ObjectivePanel';
import { ResultModal } from '../ResultModal/ResultModal';
import { ExperimentLog } from '../ExperimentLog/ExperimentLog';
import { RecipeLibrary } from '../RecipeLibrary/RecipeLibrary';
import { ReplayPlayback } from '../ReplayPlayback/ReplayPlayback';
import { RecipeCompare } from '../RecipeCompare/RecipeCompare';
import { useGameStore } from '@/store/gameStore';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useAudio } from '@/hooks/useAudio';
import { getLevelById, LEVELS } from '@/data/levels';
import { REAGENTS } from '@/data/reagents';
import { checkObjective } from '@/logic/chemistry';
import { calculateScore, ScoreResult } from '@/logic/scoring';
import { Recipe, SavedRecipe } from '@/types';

interface GameScreenProps {
  isFreeMode?: boolean;
}

type RightPanelMode = 'default' | 'replay' | 'library' | 'compare-select';

export const GameScreen: React.FC<GameScreenProps> = ({ isFreeMode = false }) => {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const { playDrop, playSuccess, playFail } = useAudio();

  const solution = useGameStore(state => state.solution);
  const steps = useGameStore(state => state.steps);
  const timeElapsed = useGameStore(state => state.timeElapsed);
  const isComplete = useGameStore(state => state.isComplete);
  const activeEffects = useGameStore(state => state.activeEffects);
  const currentLevelId = useGameStore(state => state.currentLevelId);
  const experimentLogs = useGameStore(state => state.experimentLogs);
  const lastScoreResult = useGameStore(state => state.lastScoreResult);
  const isInReplayMode = useGameStore(state => state.isInReplayMode);
  const currentReplayStep = useGameStore(state => state.currentReplayStep);
  
  const addReagentToBeaker = useGameStore(state => state.addReagentToBeaker);
  const stir = useGameStore(state => state.stir);
  const pourOut = useGameStore(state => state.pourOut);
  const resetBeaker = useGameStore(state => state.resetBeaker);
  const tickTime = useGameStore(state => state.tickTime);
  const checkLevelComplete = useGameStore(state => state.checkLevelComplete);
  const completeLevel = useGameStore(state => state.completeLevel);
  const exportRecipe = useGameStore(state => state.exportRecipe);
  const importRecipe = useGameStore(state => state.importRecipe);
  const setCurrentLevel = useGameStore(state => state.setCurrentLevel);
  const setMode = useGameStore(state => state.setMode);
  const ensureCurrentLevelFromUrl = useGameStore(state => state.ensureCurrentLevelFromUrl);
  const getDetailedObjectiveCheck = useGameStore(state => state.getDetailedObjectiveCheck);
  const getStarPrediction = useGameStore(state => state.getStarPrediction);
  const clearExperimentLogs = useGameStore(state => state.clearExperimentLogs);
  const getSavedRecipes = useGameStore(state => state.getSavedRecipes);
  const saveRecipeToLibrary = useGameStore(state => state.saveRecipeToLibrary);
  const renameSavedRecipe = useGameStore(state => state.renameSavedRecipe);
  const deleteSavedRecipe = useGameStore(state => state.deleteSavedRecipe);
  const loadSavedRecipe = useGameStore(state => state.loadSavedRecipe);
  const getReplaySteps = useGameStore(state => state.getReplaySteps);
  const setReplayState = useGameStore(state => state.setReplayState);

  const [isStirring, setIsStirring] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showExperimentLog, setShowExperimentLog] = useState(true);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('default');
  const [savedRecipesVersion, setSavedRecipesVersion] = useState(0);
  const [compareRecipe, setCompareRecipe] = useState<SavedRecipe | null>(null);

  const refreshSavedRecipes = useCallback(() => {
    setSavedRecipesVersion(v => v + 1);
  }, []);

  const savedRecipes = useMemo(() => {
    const r = getSavedRecipes();
    return r;
  }, [getSavedRecipes, savedRecipesVersion]);

  const replaySteps = useMemo(() => getReplaySteps(), [getReplaySteps, savedRecipesVersion, isInReplayMode]);

  const effectiveLevelId = levelId || currentLevelId;
  const level = isFreeMode ? null : getLevelById(effectiveLevelId || '');

  useEffect(() => {
    if (!isFreeMode && levelId) {
      ensureCurrentLevelFromUrl(levelId);
    } else if (isFreeMode) {
      setMode('free');
    }
  }, [isFreeMode, levelId, ensureCurrentLevelFromUrl, setMode]);

  const availableReagents = isFreeMode
    ? REAGENTS.map(r => r.id)
    : level?.availableReagents || [];

  const objectiveProgress = useMemo(() => {
    if (!level) return 0;
    return checkObjective(solution, level.objective).progress;
  }, [solution, level]);

  const detailedCheck = useMemo(() => {
    if (isFreeMode || !level) return null;
    return getDetailedObjectiveCheck();
  }, [isFreeMode, level, getDetailedObjectiveCheck, solution.ph, solution.temperature, solution.color, solution.hasGas, solution.hasPrecipitate]);

  const starPrediction = useMemo(() => {
    if (isFreeMode || !level) return null;
    return getStarPrediction();
  }, [isFreeMode, level, getStarPrediction, steps, isComplete]);

  useEffect(() => {
    if (lastScoreResult && !scoreResult) {
      setScoreResult(lastScoreResult);
      setShowResult(true);
    }
  }, [lastScoreResult, scoreResult]);

  useEffect(() => {
    if (isInReplayMode && rightPanelMode !== 'replay') {
      setRightPanelMode('replay');
    } else if (!isInReplayMode && rightPanelMode === 'replay') {
      setRightPanelMode('default');
    }
  }, [isInReplayMode, rightPanelMode]);

  const handleDrop = useCallback(
    (reagentId: string, volume: number) => {
      if (isInReplayMode) {
        alert('请先结束回放模式');
        return;
      }
      if (isComplete && !isFreeMode) return;
      if (solution.volume + volume > 500) {
        alert('烧杯容量不足！最多500mL');
        return;
      }

      playDrop();
      const reactions = addReagentToBeaker(reagentId, volume);

      if (reactions.length > 0) {
        console.log('发生反应:', reactions.map(r => r.description).join(', '));
      }

      if (!isFreeMode) {
        setTimeout(() => {
          const complete = checkLevelComplete();
          if (complete) {
            const result = completeLevel();
            setScoreResult(result);
            playSuccess();
            setTimeout(() => setShowResult(true), 1000);
          }
        }, 500);
      }
    },
    [
      isInReplayMode,
      isComplete,
      isFreeMode,
      solution.volume,
      playDrop,
      addReagentToBeaker,
      checkLevelComplete,
      completeLevel,
      playSuccess,
    ]
  );

  const {
    isDragging,
    isOver,
    dragVolume,
    setDragVolume,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop: onBeakerDrop,
    handleClickAdd,
  } = useDragDrop(handleDrop, 20);

  useEffect(() => {
    if (showResult || isFreeMode || isInReplayMode) return;

    const timer = setInterval(() => {
      tickTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, isFreeMode, isInReplayMode, tickTime]);

  useEffect(() => {
    if (!isFreeMode && !level && levelId) {
      const levelExists = getLevelById(levelId);
      if (levelExists) {
        setCurrentLevel(levelId);
      } else {
        navigate('/challenge');
      }
    }
  }, [isFreeMode, level, levelId, setCurrentLevel, navigate]);

  const handleStir = () => {
    if (solution.volume === 0) return;
    if (isInReplayMode) { alert('请先结束回放模式'); return; }
    setIsStirring(true);
    stir();
    setTimeout(() => setIsStirring(false), 2000);
  };

  const handlePourOut = () => {
    if (solution.volume === 0) return;
    if (isInReplayMode) { alert('请先结束回放模式'); return; }
    pourOut(0.5);
  };

  const handleReset = () => {
    if (isInReplayMode) { setReplayState(null); }
    resetBeaker();
    setShowResult(false);
    setShowHint(false);
    setScoreResult(null);
    setRightPanelMode('default');
    setCompareRecipe(null);
  };

  const handleExport = () => {
    if (solution.volume === 0) {
      alert('烧杯是空的，无法导出配方！');
      return;
    }
    const name = prompt('请输入配方名称:', `配方_${Date.now()}`);
    if (name !== null) {
      exportRecipe(name);
    }
  };

  const handleImport = (recipe: Recipe) => {
    if (isInReplayMode) { setReplayState(null); }
    const result = importRecipe(recipe);
    if (result.success) {
      setRightPanelMode('default');
      setCompareRecipe(null);
    }
    return result;
  };

  const handleClearLogs = () => {
    if (confirm('确定要清空实验记录吗？')) {
      clearExperimentLogs();
    }
  };

  const handleBack = () => {
    if (isInReplayMode) { setReplayState(null); }
    if (isFreeMode) {
      setMode('menu');
      navigate('/');
    } else {
      navigate('/challenge');
    }
  };

  const handleHint = () => {
    setShowHint(!showHint);
  };

  const handleRestart = () => {
    handleReset();
    if (levelId) {
      setCurrentLevel(levelId);
    }
  };

  const handleNextLevel = () => {
    if (!level) return;
    const currentIndex = LEVELS.findIndex(l => l.id === level.id);
    const nextLevel = LEVELS[currentIndex + 1];
    if (nextLevel) {
      handleReset();
      setCurrentLevel(nextLevel.id);
      navigate(`/challenge/${nextLevel.id}`);
    }
  };

  const handleBackToMenu = () => {
    setMode('menu');
    navigate('/');
  };

  const handleStartReplay = useCallback(() => {
    if (replaySteps.length <= 1) {
      alert('请先做几步实验再回放！');
      return;
    }
    setReplayState(replaySteps[0]);
    setRightPanelMode('replay');
  }, [replaySteps, setReplayState]);

  const handleCloseReplay = useCallback(() => {
    setReplayState(null);
    setRightPanelMode('default');
  }, [setReplayState]);

  const handleOpenLibrary = useCallback(() => {
    setRightPanelMode(rightPanelMode === 'library' ? 'default' : 'library');
  }, [rightPanelMode]);

  const handleStartCompare = useCallback(() => {
    setRightPanelMode('compare-select');
  }, []);

  const handleSelectForCompare = useCallback((recipe: SavedRecipe) => {
    setCompareRecipe(recipe);
  }, []);

  const handleCloseCompare = useCallback(() => {
    setCompareRecipe(null);
    setRightPanelMode('default');
  }, []);

  const handleLoadCompareRecipe = useCallback(() => {
    if (!compareRecipe) return;
    const result = loadSavedRecipe(compareRecipe.id);
    if (result.success) {
      playSuccess();
      setCompareRecipe(null);
      setRightPanelMode('default');
    } else {
      playFail();
      alert('载入失败：' + (result.error || ''));
    }
  }, [compareRecipe, loadSavedRecipe, playSuccess, playFail]);

  const hasNextLevel = level
    ? LEVELS.findIndex(l => l.id === level.id) < LEVELS.length - 1
    : false;

  const displayScoreResult = scoreResult || lastScoreResult;

  const renderRightPanel = () => {
    if (rightPanelMode === 'replay' && isInReplayMode) {
      return (
        <ReplayPlayback
          steps={replaySteps}
          currentStep={currentReplayStep}
          onStepChange={setReplayState}
          onClose={handleCloseReplay}
        />
      );
    }

    if (rightPanelMode === 'library' || rightPanelMode === 'compare-select') {
      return (
        <RecipeLibrary
          recipes={savedRecipes}
          currentSolutionComponents={solution.components.map(c => ({ reagentId: c.reagentId, amount: c.amount }))}
          onRefresh={refreshSavedRecipes}
          onLoadRecipe={(id) => {
            const result = loadSavedRecipe(id);
            if (result.success) {
              setRightPanelMode('default');
              refreshSavedRecipes();
            }
            return result;
          }}
          onSaveRecipe={(name, notes) => {
            const r = saveRecipeToLibrary(name, notes);
            if (r) refreshSavedRecipes();
            return r;
          }}
          onRenameRecipe={(id, name) => {
            const r = renameSavedRecipe(id, name);
            if (r) refreshSavedRecipes();
            return r;
          }}
          onDeleteRecipe={(id) => {
            const r = deleteSavedRecipe(id);
            if (r) refreshSavedRecipes();
            return r;
          }}
          onStartReplay={isFreeMode ? handleStartReplay : undefined}
          onStartCompare={isFreeMode && rightPanelMode === 'library' ? handleStartCompare : undefined}
          onClose={() => setRightPanelMode('default')}
          compareMode={rightPanelMode === 'compare-select'}
          onSelectForCompare={rightPanelMode === 'compare-select' ? handleSelectForCompare : undefined}
        />
      );
    }

    return (
      <>
        {!isFreeMode && level && (
          <ObjectivePanel
            level={level}
            progress={objectiveProgress}
            isComplete={isComplete}
            showHint={showHint}
            detailedCheck={detailedCheck}
            starPrediction={starPrediction}
            currentSteps={steps}
          />
        )}
        <StatusPanel
          solution={solution}
          timeElapsed={timeElapsed}
          steps={steps}
        />
        
        <div className="hidden lg:block">
          <ExperimentLog
            logs={experimentLogs}
            onClear={handleClearLogs}
          />
        </div>

        {isFreeMode && (
          <button
            onClick={handleOpenLibrary}
            className="w-full font-pixel text-xs text-yellow-400 bg-stone-800 border-2 border-yellow-600 py-2 px-4 hover:bg-stone-700 transition-colors"
          >
            📚 配方库（{savedRecipes.length}个配方）
          </button>
        )}

        <div className="lg:hidden">
          <button
            onClick={() => setShowExperimentLog(!showExperimentLog)}
            className="w-full font-pixel text-xs text-cyan-400 bg-stone-800 border-2 border-cyan-600 py-2 px-4 hover:bg-stone-700 transition-colors"
          >
            {showExperimentLog ? '▼ 隐藏实验记录' : '▶ 显示实验记录'}
          </button>
        </div>

        {showExperimentLog && (
          <div className="lg:hidden mt-4">
            <ExperimentLog
              logs={experimentLogs}
              onClear={handleClearLogs}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3 space-y-4">
              <ReagentRack
                reagentIds={availableReagents}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClickAdd={handleClickAdd}
                dragVolume={dragVolume}
                setDragVolume={setDragVolume}
              />
              
              {rightPanelMode === 'default' && showExperimentLog && (
                <div className="lg:hidden mt-4">
                  <ExperimentLog
                    logs={experimentLogs}
                    onClear={handleClearLogs}
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center py-8 relative">
              {isInReplayMode && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-cyan-900 px-4 py-2 border-2 border-cyan-500 z-10">
                  <span className="font-pixel text-xs text-cyan-300 animate-pulse">
                    ▶ 回放模式中
                  </span>
                </div>
              )}
              <Beaker
                solution={solution}
                isOver={isOver}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={onBeakerDrop}
                gasIntensity={activeEffects.gasIntensity}
                heatIntensity={activeEffects.heatIntensity}
                isStirring={isStirring}
              />
            </div>

            <div className="lg:col-span-4 space-y-4">
              {renderRightPanel()}
            </div>
          </div>
        </div>
      </div>

      <Toolbar
        onStir={handleStir}
        onPourOut={handlePourOut}
        onReset={handleReset}
        onExport={isFreeMode ? handleExport : undefined}
        onImport={isFreeMode ? handleImport : undefined}
        onBack={handleBack}
        onHint={!isFreeMode ? handleHint : undefined}
        isFreeMode={isFreeMode}
        disabled={(isComplete && !isFreeMode) || isInReplayMode}
      />

      {!isFreeMode && displayScoreResult && (
        <ResultModal
          isOpen={showResult}
          result={displayScoreResult}
          levelName={level?.name || ''}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onBackToMenu={handleBackToMenu}
          hasNextLevel={hasNextLevel}
        />
      )}

      {compareRecipe && (
        <RecipeCompare
          leftName="当前实验"
          leftSolution={solution}
          leftSteps={steps}
          rightRecipe={compareRecipe}
          onClose={handleCloseCompare}
          onLoadRight={handleLoadCompareRecipe}
        />
      )}
    </div>
  );
};
