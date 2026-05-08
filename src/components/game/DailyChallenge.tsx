"use client";

import { useEffect } from 'react';
import { useDailyStore } from '@/store/dailyStore';
import { useGameStore } from '@/store/gameStore';
import { useProgressionStore } from '@/store/progressionStore';
import { getElementById } from '@/lib/gameData';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Target, Footprints, Trophy, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';

export const DailyChallenge = () => {
  const { currentChallenge, stepsTaken, completedToday, bestScoreToday, resetDaily, completeDaily, initDaily } = useDailyStore();
  const { discoveredElements, setCanvasOrbs } = useGameStore();
  const { recordDailyCompleted, syncBadges } = useProgressionStore();

  useEffect(() => {
    initDaily();
  }, [initDaily]);

  useEffect(() => {
    if (currentChallenge) {
      setCanvasOrbs(
        currentChallenge.startingElements.map((elId, i) => ({
          id: `daily_${i}_${Date.now()}`,
          elementId: elId,
          x: 320 + i * 100,
          y: 280,
          isNew: false,
        }))
      );
    }
  }, [currentChallenge?.date]);

  useEffect(() => {
    if (currentChallenge && discoveredElements.includes(currentChallenge.targetElementId) && !completedToday) {
      completeDaily(stepsTaken);
      recordDailyCompleted();
      syncBadges();
    }
  }, [discoveredElements, currentChallenge, completedToday]);

  if (!currentChallenge) return null;

  const target = getElementById(currentChallenge.targetElementId);
  const isComplete = discoveredElements.includes(currentChallenge.targetElementId);
  const isOverLimit = stepsTaken > currentChallenge.maxSteps;

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const hoursLeft = Math.floor((tomorrow.getTime() - now.getTime()) / 3600000);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 shadow-lg flex items-center gap-4"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
          <CalendarDays className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-indigo-900">Daily Challenge</p>
          <p className="text-[10px] text-indigo-900/50">{currentChallenge.hint}</p>
        </div>
      </div>

      <div className="h-6 w-px bg-indigo-100" />

      <div className="flex items-center gap-1.5 text-xs text-indigo-900/70">
        <Target className="w-3.5 h-3.5" />
        <span className="font-semibold">{target?.emoji} {target?.name}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-indigo-900/70">
        <Footprints className="w-3.5 h-3.5" />
        <span className={isOverLimit ? 'text-red-500 font-bold' : ''}>
          {stepsTaken} / {currentChallenge.maxSteps}
        </span>
      </div>

      {bestScoreToday && (
        <div className="flex items-center gap-1 text-[10px] text-amber-600">
          <Trophy className="w-3 h-3" />
          {bestScoreToday}
        </div>
      )}

      <div className="flex items-center gap-1 text-[10px] text-indigo-900/40">
        <Clock className="w-3 h-3" />
        {hoursLeft}h left
      </div>

      <button
        onClick={resetDaily}
        className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 transition-colors"
        title="Reset daily"
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
            Done!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};