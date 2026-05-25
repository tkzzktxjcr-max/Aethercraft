"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComboData {
  count: number;
  multiplier: number;
  id: number;
}

interface ComboCounterProps {
  comboCount: number;
  lastDiscoveryTime: number;
}

export const ComboCounter = () => {
  const [combo, setCombo] = useState<ComboData | null>(null);
  const [, setLastDiscoveryTime] = useState(0);

  useEffect(() => {
    const handler = (e: CustomEvent<ComboCounterProps>) => {
      const { comboCount, lastDiscoveryTime } = e.detail;
      setLastDiscoveryTime(lastDiscoveryTime);
      if (comboCount >= 2) {
        const multipliers = { 2: 1.5, 3: 2, 4: 2.5, 5: 3 };
        const multiplier = multipliers[comboCount as keyof typeof multipliers] || 3;
        setCombo({ count: comboCount, multiplier, id: Date.now() });
      } else {
        setCombo(null);
      }
    };
    window.addEventListener('combo-update', handler as EventListener);
    return () => window.removeEventListener('combo-update', handler as EventListener);
  }, []);

  return (
    <div className="absolute top-28 right-4 z-[55] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {combo && (
          <motion.div
            key={combo.id}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col items-center gap-1"
          >
            <motion.div
              className="px-3 py-1.5 rounded-full font-black text-white text-sm shadow-lg"
              style={{
                background: combo.count >= 5
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : combo.count >= 3
                  ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                  : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: combo.count >= 5
                  ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                  : combo.count >= 3
                  ? '0 4px 16px rgba(245, 158, 11, 0.4)'
                  : '0 4px 16px rgba(139, 92, 246, 0.4)',
              }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🔥 COMBO x{combo.count}
            </motion.div>
            <span className="text-[10px] font-bold text-indigo-900/60">
              +{Math.round((combo.multiplier - 1) * 100)}% XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function dispatchComboUpdate(comboCount: number, lastDiscoveryTime: number) {
  window.dispatchEvent(
    new CustomEvent('combo-update', { detail: { comboCount, lastDiscoveryTime } })
  );
}
