"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

interface ToastData {
  id: number;
  elementEmoji: string;
  elementName: string;
  discoverer: string;
}

export const FirstDiscoveryToast = () => {
  const { recentDiscoveries } = useGameStore();
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    if (recentDiscoveries.length === 0) return;
    const latest = recentDiscoveries[0];
    if (!latest || !latest.isFirst) return;

    const now = Date.now();
    if (now - latest.timestamp < 3000) {
      const toast: ToastData = {
        id: Date.now(),
        elementEmoji: latest.elementEmoji,
        elementName: latest.elementName,
        discoverer: latest.discoverer || 'You',
      };
      setToasts((prev) => [...prev.slice(-2), toast]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [recentDiscoveries]);

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative"
          >
            <div
              className="px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl border"
              style={{
                background: 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(35, 90%, 45%))',
                borderColor: 'hsl(45, 90%, 65%)',
                boxShadow: '0 8px 32px hsl(45, 90%, 50%, 0.35), 0 0 60px hsl(45, 90%, 50%, 0.2)',
              }}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">
                  First Discovery!
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{toast.elementEmoji}</span>
                  <span className="text-sm font-bold text-white">{toast.elementName}</span>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-white/70 ml-2 animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4 + i * 2,
                  height: 4 + i * 2,
                  backgroundColor: ['#fbbf24', '#f59e0b', '#fcd34d', '#f97316', '#fde047'][i],
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 160,
                  y: (Math.random() - 0.5) * 160 - 40,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 1.2, delay: i * 0.08, ease: 'easeOut' }}
              />
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
