"use client";

import { useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { ElementOrb } from '@/components/ui/ElementOrb';
import { AIGeneratingOverlay } from '@/components/ai/AIGeneratingOverlay';
import { FusionEffect } from './FusionEffect';
import { AnimatePresence } from 'framer-motion';
import { ELEMENTS } from '@/lib/gameData';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { canvasOrbs, selectElement, isGenerating, generatingElements } = useGameStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (
      e.target === canvasRef.current ||
      (e.target as HTMLElement).dataset?.canvas === 'true'
    ) {
      selectElement(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementId = e.dataTransfer.getData('elementId');
    if (!elementId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addOrb(elementId, x, y);
    selectElement(elementId);
  };

  return (
    <div
      ref={canvasRef}
      data-canvas="true"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
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