"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { usePuzzleStore } from '@/store/puzzleStore';
import { useProgressionStore } from '@/store/progressionStore';
import { PUZZLES } from '@/lib/puzzles';
import { getElementById } from '@/lib/gameData';
import { GlassCard } from '@/components/ui/GlassCard';
import { X, Target, Footprints, Lightbulb, CheckCircle2, Lock, Star } from 'lucide-react';

interface PuzzleSelectorProps {
  open: boolean;
  onClose: () => void;
}

export const PuzzleSelector = ({ open, onClose }: PuzzleSelectorProps) => {
  const { completedPuzzles, bestScores, startPuzzle, currentPuzzleId } = usePuzzleStore();
  const { stats } = useProgressionStore();

  const byDifficulty = {
    easy: PUZZLES.filter((p) => p.difficulty === 'easy'),
    medium: PUZZLES.filter((p) => p.difficulty === 'medium'),
    hard: PUZZLES.filter((p) => p.difficulty === 'hard'),
  };

  const difficultyConfig = {
    easy: { label: 'Easy', color: 'bg-emerald-100 text-emerald-700', icon: Star },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700', icon: Star },
    hard: { label: 'Hard', color: 'bg-rose-100 text-rose-700', icon: Star },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-900/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[80vh] flex flex-col"
          >
            <GlassCard className="p-6 flex flex-col max-h-full">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Puzzles
                </h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-indigo-100 text-indigo-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto space-y-5 pr-1">
                {(Object.keys(byDifficulty) as Array<keyof typeof byDifficulty>).map((diff) => (
                  <div key={diff}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${difficultyConfig[diff].color}`}>
                        {difficultyConfig[diff].label}
                      </span>
                      <span className="text-[10px] text-indigo-900/40">
                        {byDifficulty[diff].filter((p) => completedPuzzles.includes(p.id)).length} / {byDifficulty[diff].length} completed
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {byDifficulty[diff].map((puzzle) => {
                        const isCompleted = completedPuzzles.includes(puzzle.id);
                        const isActive = currentPuzzleId === puzzle.id;
                        const best = bestScores[puzzle.id];
                        const target = getElementById(puzzle.targetElementId);

                        return (
                          <button
                            key={puzzle.id}
                            onClick={() => {
                              startPuzzle(puzzle.id);
                              onClose();
                            }}
                            className={[
                              "flex flex-col p-3 rounded-xl border text-left transition-all hover:scale-[1.02]",
                              isActive
                                ? "bg-amber-50 border-amber-300 shadow-sm"
                                : isCompleted
                                  ? "bg-emerald-50/50 border-emerald-200/50"
                                  : "bg-white/60 border-indigo-100/50 hover:bg-white/90"
                            ].join(' ')}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-lg">{target?.emoji}</span>
                              <span className="font-bold text-sm text-indigo-900">{puzzle.name}</span>
                              {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                              {isActive && <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Active</span>}
                            </div>
                            <p className="text-xs text-indigo-900/60 mb-2">{puzzle.description}</p>
                            <div className="flex items-center gap-3 text-[10px] text-indigo-900/40">
                              <span className="flex items-center gap-1">
                                <Footprints className="w-3 h-3" />
                                {puzzle.maxSteps} max
                              </span>
                              {best && (
                                <span className="flex items-center gap-1 text-emerald-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Best: {best} steps
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex gap-1">
                              {puzzle.hints.slice(0, 2).map((hint, i) => (
                                <span key={i} className="flex items-center gap-1 text-[9px] text-indigo-900/30 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  <Lightbulb className="w-2.5 h-2.5" />
                                  {hint}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-100 shrink-0 flex items-center justify-between">
                <span className="text-xs text-indigo-900/50">
                  {stats.puzzlesSolved} puzzles solved
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-semibold hover:bg-indigo-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};