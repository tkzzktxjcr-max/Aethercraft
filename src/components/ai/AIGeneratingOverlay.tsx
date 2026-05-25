"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2 } from 'lucide-react';
import { getElementById } from '@/lib/gameData';

export const AIGeneratingOverlay = () => {
  const { isGenerating, generatingElements, generatingOrb } = useGameStore();
  const elA = generatingElements?.[0];
  const elB = generatingElements?.[1];
  const elementA = elA ? getElementById(elA) : null;
  const elementB = elB ? getElementById(elB) : null;
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const prog = generatingOrb?.progress || '';
    setTypedText(prog);
  }, [generatingOrb?.progress]);

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl px-6 py-4 shadow-2xl border border-violet-200/80 flex flex-col items-center gap-3 min-w-[280px]">
            <div className="relative w-24 h-10 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                  animate={{
                    x: [0, Math.cos((i * Math.PI) / 2) * 40, 0],
                    y: [0, Math.sin((i * Math.PI) / 2) * 20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.3, 0.8],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                  style={{ left: '50%', top: '50%', marginLeft: -3, marginTop: -3 }}
                />
              ))}

              <div className="flex items-center justify-center gap-3">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {elementA?.emoji || '?'}
                </motion.span>
                <Wand2 className="w-4 h-4 text-violet-400 animate-spin" style={{ animationDuration: '3s' }} />
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  {elementB?.emoji || '?'}
                </motion.span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full">
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-indigo-900 truncate">
                  {typedText || 'The AI is forging...'}
                </p>
              </div>
            </div>

            <div className="w-full h-1.5 bg-indigo-100/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-violet-500 relative"
                animate={{ width: ['0%', '70%', '40%', '90%', '60%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute inset-y-0 right-0 w-8 bg-white/30 blur-sm animate-pulse" />
              </motion.div>
            </div>

            <div className="flex items-center justify-between w-full">
              <p className="text-[9px] text-indigo-900/40">
                Keep playing while the forge works...
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
