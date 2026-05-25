"use client";

import { useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getElementById } from '@/lib/gameData';
import { motion } from 'framer-motion';
import { playDragSound } from '@/lib/audio';
import { cn } from '@/lib/utils';

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
  const { moveOrb, removeOrb, tryCombine, selectElement, selectedElementId } = useGameStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, orbX: 0, orbY: 0 });
  const lastPos = useRef({ x, y });
  const element = getElementById(elementId);

  if (!element) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    playDragSound();
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      orbX: x,
      orbY: y,
    };
    lastPos.current = { x, y };
    selectElement(elementId);

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newX = dragStart.current.orbX + dx;
      const newY = dragStart.current.orbY + dy;
      lastPos.current = { x: newX, y: newY };
      moveOrb(orbId, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      const state = useGameStore.getState();
      const { x: finalX, y: finalY } = lastPos.current;
      const otherOrb = state.canvasOrbs.find((o) => {
        if (o.id === orbId) return false;
        const dist = Math.sqrt((o.x - finalX) ** 2 + (o.y - finalY) ** 2);
        return dist < 50;
      });

      if (otherOrb) {
        state.tryCombine(orbId, otherOrb.id);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const typeColors: Record<string, string> = {
    energy: 'border-amber-300 bg-amber-50',
    liquid: 'border-blue-300 bg-blue-50',
    life: 'border-emerald-300 bg-emerald-50',
    cosmic: 'border-violet-300 bg-violet-50',
    matter: 'border-stone-300 bg-stone-50',
    gas: 'border-cyan-300 bg-cyan-50',
  };

  return (
    <motion.div
      initial={isNew ? { scale: 0, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1, x, y }}
      transition={isNew ? { type: 'spring', stiffness: 400, damping: 20 } : { duration: 0 }}
      className={cn(
        'absolute cursor-grab active:cursor-grabbing select-none z-10',
        isDragging && 'z-30 cursor-grabbing'
      )}
      style={{ left: 0, top: 0 }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => selectElement(elementId)}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shadow-sm transition-all hover:shadow-md',
          typeColors[element.type] || 'border-indigo-200 bg-white',
          selectedElementId === elementId && 'ring-2 ring-violet-400 ring-offset-2',
          isAI && 'border-violet-300',
          isGenerating && 'animate-pulse'
        )}
      >
        <span className="text-2xl leading-none">{element.emoji}</span>
        <span className="text-[9px] font-bold text-indigo-900 mt-0.5 truncate max-w-[56px] text-center leading-tight">
          {element.name}
        </span>
      </div>
      {isAI && (
        <span className="absolute -top-1 -right-1 bg-violet-100 text-violet-700 rounded-full px-1 py-0.5 text-[8px] font-bold">
          AI
        </span>
      )}
    </motion.div>
  );
};