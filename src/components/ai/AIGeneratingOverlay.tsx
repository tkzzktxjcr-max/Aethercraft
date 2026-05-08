"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getElementById } from '@/lib/gameData';
import { Sparkles } from 'lucide-react';

export const AIGeneratingOverlay = () => {
  const { isGenerating, generatingElements } = useGameStore();

  const a = generatingElements?.[0];
  const b = generatingElements?.[1];
  const elA = a ? getElementById(a) : null;
  const elB = b ? getElementById(b) : null;

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-900/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-xs mx-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl animate-bounce">{elA?.emoji || '?'}</span>
              <span className="text-xl text-indigo-300">+</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>
                {elB?.emoji || '?'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
              <p className="text-sm font-semibold text-indigo-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-500" />
                The AI is thinking...
              </p>
            </div>

            <p className="text-xs text-indigo-900/50 text-center">
              The local model generates a unique new element
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};