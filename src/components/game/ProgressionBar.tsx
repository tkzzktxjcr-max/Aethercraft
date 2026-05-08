"use client";

import { useProgressionStore } from '@/store/progressionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Flame, Award } from 'lucide-react';

export const ProgressionBar = () => {
  const { xp, level, levelTitle, nextLevelXp, streak, newlyUnlocked, clearNewlyUnlocked } = useProgressionStore();
  const progress = nextLevelXp > 0 ? (xp / nextLevelXp) * 100 : 100;

  return (
    <div className="flex items-center gap-3 relative">
      <div className="flex flex-col min-w-[140px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
            {levelTitle}
          </span>
          <span className="text-[10px] text-indigo-900/60">
            Lv.{level}
          </span>
        </div>
        <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[9px] text-indigo-900/40">{xp} XP</span>
          <span className="text-[9px] text-indigo-900/40">{nextLevelXp} XP</span>
        </div>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 text-orange-700">
          <Flame className="w-3 h-3" />
          <span className="text-[10px] font-bold">{streak}</span>
        </div>
      )}

      <AnimatePresence>
        {newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute top-full right-0 mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-lg flex items-center gap-2 z-50"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-800">
              Badge Unlocked!
            </span>
            <button
              onClick={clearNewlyUnlocked}
              className="ml-1 text-amber-600 hover:text-amber-800"
            >
              <Star className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};