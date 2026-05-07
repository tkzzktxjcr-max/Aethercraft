"use client";

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { getElementById } from '@/lib/gameData';
import { cn } from '@/lib/utils';
import { useCallback } from 'react';

interface ElementOrbProps {
  orbId: string;
  elementId: string;
  x: number;
  y: number;
  isNew?: boolean;
  isAI?: boolean;
  isGenerating?: boolean;
}

export const ElementOrb = ({ orbId, elementId, x, y, isNew, isAI, isGenerating }: ElementOrbProps) => {
  const { moveOrb, tryCombine, canvasOrbs, selectElement, selectedElementId } = useGameStore();
  const element = getElementById(elementId);

  const handleDragEnd = useCallback(
    (_: any, info: any) => {
      const newX = x + info.offset.x;
      const newY = y + info.offset.y;
      moveOrb(orbId, newX, newY);

      const other = canvasOrbs.find((o) => {
        if (o.id === orbId) return false;
        const dx = o.x + 36 - (newX + 36);
        const dy = o.y + 36 - (newY + 36);
        return Math.sqrt(dx * dx + dy * dy) < 70;
      });

      if (other) {
        tryCombine(orbId, other.id);
      }
    },
    [x, y, orbId, canvasOrbs, moveOrb, tryCombine]
  );

  if (!element) return null;

  const isSelected = selectedElementId === elementId;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={isNew ? { scale: 0, opacity: 0, x, y } : { x, y }}
      animate={{ x, y, scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileDrag={{ scale: 1.15, zIndex: 100 }}
      whileHover={{ scale: 1.05 }}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        selectElement(elementId);
      }}
      className={cn(
        'absolute w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none',
        'bg-white shadow-lg border-2 transition-shadow',
        isSelected ? 'ring-4 ring-violet-300 border-violet-400 z-50' : 'border-indigo-100 z-20',
        isAI && 'border-dashed border-violet-400 shadow-violet-200 shadow-xl',
        isNew && 'ring-4 ring-amber-300',
        isGenerating && 'animate-pulse ring-4 ring-violet-400'
      )}
      style={{ left: 0, top: 0 }}
    >
      <span className="text-3xl leading-none">{element.emoji}</span>
      <span className="text-[9px] font-bold text-indigo-900 mt-0.5 truncate max-w-[60px] text-center">
        {element.name}
      </span>

      {isAI && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center shadow-sm">
          ✨
        </span>
      )}
    </motion.div>
  );
};