"use client";

import { useProgressionStore, ALL_BADGES } from '@/store/progressionStore';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export const BadgeCollection = () => {
  const { badges } = useProgressionStore();

  return (
    <div className="grid grid-cols-3 gap-2">
      {ALL_BADGES.map((badge) => {
        const isUnlocked = badges.includes(badge.id);
        return (
          <motion.div
            key={badge.id}
            whileHover={isUnlocked ? { scale: 1.05 } : {}}
            className={[
              "flex flex-col items-center p-2 rounded-xl border transition-colors",
              isUnlocked
                ? "bg-white/80 border-indigo-100"
                : "bg-indigo-50/30 border-indigo-100/30 opacity-50"
            ].join(' ')}
            title={badge.description}
          >
            <span className="text-2xl mb-1">{isUnlocked ? badge.emoji : '🔒'}</span>
            <span className="text-[9px] font-bold text-center text-indigo-900 leading-tight">
              {badge.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};