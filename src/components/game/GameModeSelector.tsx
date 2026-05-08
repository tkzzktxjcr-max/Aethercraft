"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useProgressionStore } from '@/store/progressionStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sparkles, Puzzle, CalendarDays, Swords, Infinity, X } from 'lucide-react';

interface GameModeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export const GameModeSelector = ({ open, onClose }: GameModeSelectorProps) => {
  const { setGameMode, gameMode } = useGameStore();
  const { stats, streak } = useProgressionStore();

  const modes = [
    {
      id: 'sandbox' as const,
      name: 'Sandbox',
      description: 'Free exploration. Combine anything.',
      icon: Infinity,
      color: 'bg-violet-100 text-violet-700',
      stats: null,
    },
    {
      id: 'puzzle' as const,
      name: 'Puzzle',
      description: 'Solve crafted challenges.',
      icon: Puzzle,
      color: 'bg-amber-100 text-amber-700',
      stats: `${stats.puzzlesSolved} solved`,
    },
    {
      id: 'daily' as const,
      name: 'Daily',
      description: 'One challenge. Same for everyone.',
      icon: CalendarDays,
      color: 'bg-emerald-100 text-emerald-700',
      stats: `${stats.dailyChallengesCompleted} completed`,
    },
    {
      id: 'versus' as const,
      name: 'Versus',
      description: 'Local 1v1 race to the target.',
      icon: Swords,
      color: 'bg-rose-100 text-rose-700',
      stats: 'Local only',
    },
  ];

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
            className="w-full max-w-lg"
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Select Mode
                </h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-indigo-100 text-indigo-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setGameMode(mode.id);
                      onClose();
                    }}
                    className={[
                      "flex flex-col items-start p-4 rounded-xl border transition-all hover:scale-[1.02] text-left",
                      gameMode === mode.id
                        ? "bg-white border-violet-300 shadow-md"
                        : "bg-white/60 border-indigo-100/50 hover:bg-white/90"
                    ].join(' ')}
                  >
                    <div className={`w-10 h-10 rounded-xl ${mode.color} flex items-center justify-center mb-3`}>
                      <mode.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-indigo-900 mb-1">{mode.name}</h3>
                    <p className="text-xs text-indigo-900/60 mb-2">{mode.description}</p>
                    {mode.stats && (
                      <span className="text-[10px] font-semibold text-indigo-900/40 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {mode.stats}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {streak > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-xs font-bold text-orange-800">
                    {streak} day streak! Keep it up!
                  </span>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};