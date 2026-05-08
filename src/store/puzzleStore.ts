import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Puzzle } from '@/types/game';
import { PUZZLES } from '@/lib/puzzles';

interface PuzzleState {
  currentPuzzleId: string | null;
  stepsTaken: number;
  bestScores: Record<string, number>;
  completedPuzzles: string[];
  startPuzzle: (puzzleId: string) => void;
  recordStep: () => void;
  completePuzzle: () => void;
  resetPuzzle: () => void;
  getCurrentPuzzle: () => Puzzle | null;
  isObjectiveMet: (discoveredElements: string[]) => boolean;
}

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      currentPuzzleId: null,
      stepsTaken: 0,
      bestScores: {},
      completedPuzzles: [],

      startPuzzle: (puzzleId) => {
        const puzzle = PUZZLES.find((p) => p.id === puzzleId);
        if (!puzzle) return;
        set({
          currentPuzzleId: puzzleId,
          stepsTaken: 0,
        });
      },

      recordStep: () => set((state) => ({ stepsTaken: state.stepsTaken + 1 })),

      completePuzzle: () => {
        const { currentPuzzleId, stepsTaken, bestScores } = get();
        if (!currentPuzzleId) return;
        const prevBest = bestScores[currentPuzzleId] || Infinity;
        set((state) => ({
          completedPuzzles: state.completedPuzzles.includes(currentPuzzleId)
            ? state.completedPuzzles
            : [...state.completedPuzzles, currentPuzzleId],
          bestScores: {
            ...state.bestScores,
            [currentPuzzleId]: Math.min(prevBest, stepsTaken),
          },
        }));
      },

      resetPuzzle: () => {
        const { currentPuzzleId } = get();
        if (!currentPuzzleId) return;
        get().startPuzzle(currentPuzzleId);
      },

      getCurrentPuzzle: () => {
        return PUZZLES.find((p) => p.id === get().currentPuzzleId) || null;
      },

      isObjectiveMet: (discoveredElements) => {
        const puzzle = get().getCurrentPuzzle();
        if (!puzzle) return false;
        return discoveredElements.includes(puzzle.targetElementId);
      },
    }),
    {
      name: 'aethercraft-puzzles',
      partialize: (state) => ({
        bestScores: state.bestScores,
        completedPuzzles: state.completedPuzzles,
      }),
    }
  )
);