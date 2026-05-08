"use client";

import { useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getElementById, COMBINATIONS } from '@/lib/gameData';
import { motion } from 'framer-motion';
import { TreePine, Sparkles, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export const DiscoveryTree = () => {
  const { selectedElementId, discoveredElements, aiCombinations } = useGameStore();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  if (!selectedElementId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-indigo-900/40 text-sm gap-3">
        <TreePine className="w-8 h-8 opacity-30" />
        <p>Select an element to view its provenance</p>
      </div>
    );
  }

  const buildNode = (elementId: string, depth = 0): React.ReactNode => {
    if (depth > 5) return null;
    const element = getElementById(elementId);
    if (!element) return null;

    let combo = COMBINATIONS.find(c =>
      c.result === elementId &&
      discoveredElements.includes(c.elementA) &&
      discoveredElements.includes(c.elementB)
    );

    let isAICombo = false;
    if (!combo) {
      const aiCombo = Object.values(aiCombinations).find(c =>
        c.resultId === elementId &&
        discoveredElements.includes(c.elementA) &&
        discoveredElements.includes(c.elementB)
      );
      if (aiCombo) {
        combo = { id: aiCombo.id, elementA: aiCombo.elementA, elementB: aiCombo.elementB, result: aiCombo.resultId };
        isAICombo = true;
      }
    }

    const isBase = !combo;

    return (
      <div className="flex flex-col items-center min-w-[100px]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: depth * 0.1, type: 'spring' }}
          className={[
            "flex flex-col items-center px-3 py-2 rounded-xl border shadow-sm mb-3 relative cursor-pointer hover:shadow-md transition-shadow",
            isBase ? "bg-indigo-50/80 border-indigo-200" : isAICombo ? "bg-violet-50/80 border-violet-200" : "bg-white/80 border-indigo-100"
          ].join(' ')}
        >
          {isAICombo && (
            <span className="absolute -top-1.5 -right-1.5 bg-violet-100 text-violet-700 rounded-full p-0.5">
              <Sparkles className="w-3 h-3" />
            </span>
          )}
          <span className="text-xl leading-none">{element.emoji}</span>
          <span className="text-[10px] font-bold text-indigo-900 mt-1">{element.name}</span>
        </motion.div>

        {combo && (
          <>
            <div className="w-px h-4 bg-indigo-200" />
            <div className="flex gap-8 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(50%+16px)] h-px bg-indigo-200" />
              <div className="flex flex-col items-center pt-4">
                {buildNode(combo.elementA, depth + 1)}
              </div>
              <div className="flex flex-col items-center pt-4">
                {buildNode(combo.elementB, depth + 1)}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1 mb-2 shrink-0">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 2))} className="p-1 rounded hover:bg-indigo-100 text-indigo-400">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-1 rounded hover:bg-indigo-100 text-indigo-400">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="p-1 rounded hover:bg-indigo-100 text-indigo-400">
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-indigo-900/40 ml-auto">{Math.round(scale * 100)}%</span>
      </div>
      <div
        className="flex-1 overflow-auto cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => {
          setIsDragging(true);
          dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;
          setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="min-w-[300px] p-4 flex justify-center"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: 'top center' }}
        >
          {buildNode(selectedElementId)}
        </div>
      </div>
    </div>
  );
};