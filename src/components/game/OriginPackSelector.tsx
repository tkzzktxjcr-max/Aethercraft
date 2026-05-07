"use client";

import { motion } from 'framer-motion';
import { ORIGIN_PACKS, getElementById } from '@/lib/gameData';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const OriginPackSelector = () => {
  const { selectPack, playerName } = useGameStore();
  const navigate = useNavigate();
  
  const handleSelect = (packId: string) => {
    selectPack(packId);
    navigate('/game');
  };
  
  const packIcons: Record<string, string> = {
    classical: '🔥',
    celestial: '⭐',
    vital: '🌱',
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
      {ORIGIN_PACKS.map((pack, i) => (
        <motion.div
          key={pack.id}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <GlassCard 
            className="p-6 h-full flex flex-col hover:scale-[1.03] hover:bg-white/85 transition-all duration-300"
            onClick={() => handleSelect(pack.id)}
          >
            <div 
              className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center text-3xl shadow-sm"
              style={{ backgroundColor: pack.themeColor + '18' }}
            >
              {packIcons[pack.id]}
            </div>
            <h3 className="text-lg font-bold text-indigo-900 mb-1">{pack.name}</h3>
            <p className="text-sm text-indigo-900/60 mb-5 flex-1 leading-relaxed">
              {pack.description}
            </p>
            
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/40">
                Starter Elements
              </p>
              <div className="flex gap-3">
                {pack.elements.map(elId => {
                  const el = getElementById(elId);
                  return (
                    <div key={elId} className="flex flex-col items-center gap-1">
                      <span className="text-2xl">{el?.emoji}</span>
                      <span className="text-[9px] font-semibold text-indigo-900/70">{el?.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-indigo-100/50 flex items-center justify-between">
              <span className="text-xs text-indigo-900/40">Play as {playerName || 'Guest'}</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-violet-600">
                <Sparkles className="w-3.5 h-3.5" />
                Choose
              </span>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
};