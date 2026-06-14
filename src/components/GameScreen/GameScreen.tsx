import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Beaker } from '../Beaker/Beaker';
import { ReagentRack } from '../ReagentRack/ReagentRack';
import { StatusPanel } from '../StatusPanel/StatusPanel';
import { Toolbar } from '../Toolbar/Toolbar';
import { ObjectivePanel } from '../ObjectivePanel/ObjectivePanel';
import { ResultModal } from '../ResultModal/ResultModal';
import { useGameStore } from '@/store/gameStore';
import { useDragDrop } from '@/hooks/useDragDrop';
import { useAudio } from '@/hooks/useAudio';
import { getLevelById, LEVELS } from '@/data/levels';
import { REAGENTS } from '@/data/reagents';
import { checkObjective } from '@/logic/chemistry';
import { calculateScore, ScoreResult } from '@/logic/scoring';

interface GameScreenProps {
  isFreeMode?: boolean;
}

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
  const addReagentToBeaker = useGameStore(state => state.addReagentToBeaker);
  const stir = useGameStore(state => state.stir);
  const pourOut = useGameStore(state => state.pourOut);
  const resetBeaker = useGameStore(state => state.resetBeaker);
  const tickTime = useGameStore(state => state.tickTime);
  const checkLevelComplete = useGameStore(state => state.checkLevelComplete);
  const completeLevel = useGameStore(state => state.completeLevel);
  const exportRecipe = useGameStore(state => state.exportRecipe);
  const setCurrentLevel = useGameStore(state => state.setCurrentLevel);
  const setMode = useGameStore(state => state.setMode);

  const [isStirring, setIsStirring] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  const level = isFreeMode ? null : getLevelById(levelId || currentLevelId || '');

  const availableReagents = isFreeMode
    ? REAGENTS.map(r => r.id)
    : level?.availableReagents || [];

  const objectiveProgress = level
    ? checkObjective(solution, level.objective).progress
    : 0;

  const handleDrop = useCallback(
    (reagentId: string, volume: number) => {
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
    if (showResult || isFreeMode) return;

    const timer = setInterval(() => {
      tickTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, isFreeMode, tickTime]);

  useEffect(() => {
    if (!isFreeMode && !level && levelId) {
      setCurrentLevel(levelId);
    }
  }, [isFreeMode, level, levelId, setCurrentLevel]);

  const handleStir = () => {
    if (solution.volume === 0) return;
    setIsStirring(true);
    stir();
    setTimeout(() => setIsStirring(false), 2000);
  };

  const handlePourOut = () => {
    if (solution.volume === 0) return;
    pourOut(0.5);
  };

  const handleReset = () => {
    resetBeaker();
    setShowResult(false);
    setShowHint(false);
    setScoreResult(null);
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

  const handleBack = () => {
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

  const hasNextLevel = level
    ? LEVELS.findIndex(l => l.id === level.id) < LEVELS.length - 1
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-3">
              <ReagentRack
                reagentIds={availableReagents}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onClickAdd={handleClickAdd}
                dragVolume={dragVolume}
                setDragVolume={setDragVolume}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col items-center justify-center py-8">
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
              {!isFreeMode && level && (
                <ObjectivePanel
                  level={level}
                  progress={objectiveProgress}
                  isComplete={isComplete}
                  showHint={showHint}
                />
              )}
              <StatusPanel
                solution={solution}
                timeElapsed={timeElapsed}
                steps={steps}
              />
            </div>
          </div>
        </div>
      </div>

      <Toolbar
        onStir={handleStir}
        onPourOut={handlePourOut}
        onReset={handleReset}
        onExport={isFreeMode ? handleExport : undefined}
        onBack={handleBack}
        onHint={!isFreeMode ? handleHint : undefined}
        isFreeMode={isFreeMode}
        disabled={isComplete && !isFreeMode}
      />

      {!isFreeMode && scoreResult && (
        <ResultModal
          isOpen={showResult}
          result={scoreResult}
          levelName={level?.name || ''}
          onRestart={handleRestart}
          onNextLevel={handleNextLevel}
          onBackToMenu={handleBackToMenu}
          hasNextLevel={hasNextLevel}
        />
      )}
    </div>
  );
};
