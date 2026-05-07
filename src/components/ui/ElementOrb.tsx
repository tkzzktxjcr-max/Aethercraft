"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getElementById } from '@/lib/gameData';
import { cn } from '@/lib/utils';

interface ElementOrbProps {
  orbId: string;
  elementId: string;
  x: number;
  y: number;
  isNew?: boolean;
}

const typeBorders: Record<string, string> = {
  energy: 'border-amber-400 shadow-amber-500/40',
  liquid: 'border-cyan-400 shadow-cyan-500/40',
  life: 'border-emerald-400 shadow-emerald-500/40',
  cosmic: 'border-violet-400 shadow-violet-500/40',
  matter: 'border-orange-500 shadow-orange-700/40',
  gas: 'border-sky-400 shadow-sky-500/40',
};

const typeGlows: Record<string, string> = {
  energy: 'bg-amber-500',
  liquid: 'bg-cyan-500',
  life: 'bg-emerald-500',
  cosmic: 'bg-violet-500',
  matter: 'bg-orange-600',
  gas: 'bg-sky-500',
};

export const ElementOrb = ({ orbId, elementId, x, y, isNew }: ElementOrbProps) => {
  const element = getElementById(elementId);
  if (!element) return null;
  
  const { moveOrb, tryCombine, selectElement, selectedElementId } = useGameStore();
  const isSelected = selectedElementId === elementId;
  
  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_event, info) => {
        const newX = x + info.offset.x;
        const newY = y + info.offset.y;
        
        const state = useGameStore.getState();
        const otherOrbs = state.canvasOrbs.filter(o => o.id !== orbId);
        let fused = false;
        
        for (const other of otherOrbs) {
          const dx = newX - other.x;
          const dy = newY - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 72) {
            const result = state.tryCombine(orbId, other.id);
            if (result.success) {
              fused = true;
              break;
            }
          }
        }
        
        if (!fused) {
          moveOrb(orbId, newX, newY);
        }
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectElement(elementId);
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        x, 
        y, 
        scale: 1, 
        opacity: 1,
      }}
      whileHover={{ scale: 1.08, zIndex: 30 }}
      whileDrag={{ scale: 1.15, zIndex: 50 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={cn(
        "absolute w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border-2 shadow-lg backdrop-blur-sm bg-white/80 select-none",
        typeBorders[element.type] || 'border-gray-300',
        isSelected && 'ring-2 ring-offset-2 ring-indigo-400'
      )}
      style={{ zIndex: isSelected ? 20 : 10 }}
    >
      <span className="text-2xl leading-none">{element.emoji}</span>
      <span className="text-[9px] font-semibold text-indigo-900 mt-0.5 truncate max-w-[60px] text-center leading-tight">
        {element.name}
      </span>
      
      {isNew && (
        <motion.div
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className={cn("absolute inset-0 rounded-full blur-md", typeGlows[element.type])}
        />
      )}
      
      {isSelected && (
        <div className={cn("absolute -inset-1 rounded-full opacity-20 blur-sm animate-pulse", typeGlows[element.type])} />
      )}
    </motion.div>
  );
};