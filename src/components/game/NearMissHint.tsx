"use client";

import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export const NearMissHint = () => {
  const { nearMissHint } = useGameStore();

  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[55] flex flex-col items-center pointer-events-none">
      <AnimatePresence>
        {nearMissHint && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="px-4 py-2.5 rounded-xl bg-amber-50/95 border border-amber-200 shadow-lg flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-medium text-amber-800">{nearMissHint.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
