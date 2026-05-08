"use client";

import { useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ElementOrb } from '@/components/ui/ElementOrb';
import { AIGeneratingOverlay } from '@/components/ai/AIGeneratingOverlay';
import { FusionEffect } from './FusionEffect';
import { motion, AnimatePresence } from 'framer-motion';
import { ELEMENTS } from '@/lib/gameData';
import { getElementById } from '@/lib/gameData';
import { X } from 'lucide-react';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { canvasOrbs, selectElement, isGenerating, generatingElements, failedCombo } = useGameStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (
      e.target === canvasRef.current ||
      (e.target as HTMLElement).dataset?.canvas === 'true'
    ) {
      selectElement(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      data-canvas="true"
      onClick={handleCanvasClick}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        background:
          'linear-gradient(135deg, hsl(260, 20%, 96%) 0%, hsl(280, 25%, 92%) 100%)',
      }}
    >
      <div
        data-canvas="true"
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, hsl(260, 30%, 80%) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <FusionEffect />

      <AnimatePresence>
        {failedCombo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-red-100 flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getElementById(failedCombo.a)?.emoji}</span>
                <span className="text-red-400 text-xl">+</span>
                <span className="text-3xl">{getElementById(failedCombo.b)?.emoji}</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-600 font-semibold text-sm">
                <X className="w-4 h-4" />
                These elements don't combine
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {canvasOrbs.map((orb) => {
          const isAI = ELEMENTS[orb.elementId]?.isAIGenerated === true;
          const isGeneratingOrb =
            isGenerating && generatingElements?.includes(orb.elementId);

          return (
            <ElementOrb
              key={orb.id}
              orbId={orb.id}
              elementId={orb.elementId}
              x={orb.x}
              y={orb.y}
              isNew={orb.isNew}
              isAI={isAI}
              isGenerating={isGeneratingOrb}
            />
          );
        })}
      </AnimatePresence>

      <AIGeneratingOverlay />

      {canvasOrbs.length === 0 && (
        <div
          data-canvas="true"
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <p className="text-indigo-900/30 font-medium text-lg mb-2">
              Your canvas is empty
            </p>
            <p className="text-indigo-900/20 text-sm">Add elements from your inventory</p>
          </div>
        </div>
      )}
    </div>
  );
};