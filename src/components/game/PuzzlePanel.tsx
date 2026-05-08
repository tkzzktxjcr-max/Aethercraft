"use client";

import { useEffect } from 'react';
import { usePuzzleStore } from '@/store/puzzleStore';
import { useGameStore } from '@/store/gameStore';
import { useProgressionStore } from '@/store/progressionStore';
import { getElementById } from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Footprints, RotateCcw, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';

export const PuzzlePanel = () => {
  const { currentPuzzleId, stepsTaken, getCurrentPuzzle, resetPuzzle, completePuzzle, isObjectiveMet } = usePuzzleStore();
  const { discoveredElements, setCanvasOrbs } = useGameStore();
  const { recordPuzzleSolved, syncBadges } = useProgressionStore();

  const puzzle = getCurrentPuzzle();

  useEffect(() => {
    if (puzzle) {
      setCanvasOrbs(
        puzzle.startingElements.map((elId, i) => ({
          id: `puzzle_${i}_${Date.now()}`,
          elementId: elId,
          x: 320 + i * 100,
          y: 280,
          isNew: false,
        }))
      );
    }
  }, [puzzle?.id]);

  useEffect(() => {
    if (puzzle && isObjectiveMet(discoveredElements)) {
      completePuzzle();
      recordPuzzleSolved();
      syncBadges();
    }
  }, [discoveredElements, puzzle]);

  if (!puzzle) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-lg"
      >
        <p className="text-xs font-bold text-indigo-900">No puzzle selected</p>
        <p className="text-[10px] text-indigo-900/50">Open the mode selector to choose a puzzle</p>
      </motion.div>
    );
  }

  const target = getElementById(puzzle.targetElementId);
  const isComplete = discoveredElements.includes(puzzle.targetElementId);
  const isOverLimit = stepsTaken > puzzle.maxSteps;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-lg flex items-center gap-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-lg">
          {target?.emoji}
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-900">{puzzle.name}</p>
          <p className="text-[10px] text-indigo-900/50">{puzzle.description}</p>
        </div>
      </div>

      <div className="h-6 w-px bg-indigo-100" />

      <div className="flex items-center gap-1.5 text-xs text-indigo-900/70">
        <Footprints className="w-3.5 h-3.5" />
        <span className={isOverLimit ? 'text-red-500 font-bold' : ''}>
          {stepsTaken} / {puzzle.maxSteps}
        </span>
      </div>

      <button
        onClick={resetPuzzle}
        className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 transition-colors"
        title="Reset puzzle"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold"
          >
            <CheckCircle2 className="w-3 h-3" />
            Complete!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};