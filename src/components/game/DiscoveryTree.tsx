"use client";

import { useGameStore } from '@/store/gameStore';
import { getElementById, COMBINATIONS } from '@/lib/gameData';
import { motion } from 'framer-motion';
import { TreePine, Sparkles } from 'lucide-react';

export const DiscoveryTree = () => {
  const { selectedElementId, discoveredElements, aiCombinations } = useGameStore();
  
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
    
    // Cherche d'abord dans les combinaisons prédéfinies
    let combo = COMBINATIONS.find(c => 
      c.result === elementId && 
      discoveredElements.includes(c.elementA) && 
      discoveredElements.includes(c.elementB)
    );
    
    // Si pas trouvé, cherche dans les combinaisons IA
    let isAICombo = false;
    if (!combo) {
      const aiCombo = Object.values(aiCombinations).find(c => 
        c.resultId === elementId &&
        discoveredElements.includes(c.elementA) &&
        discoveredElements.includes(c.elementB)
      );
      if (aiCombo) {
        combo = {
          id: aiCombo.id,
          elementA: aiCombo.elementA,
          elementB: aiCombo.elementB,
          result: aiCombo.resultId,
        };
        isAICombo = true;
      }
    }
    
    const isBase = !combo || depth === 0 && !combo;
    
    return (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: depth * 0.1, type: 'spring' }}
          className={[
            "flex flex-col items-center px-3 py-2 rounded-xl border shadow-sm mb-2 min-w-[80px] relative",
            isBase 
              ? "bg-indigo-50/80 border-indigo-200" 
              : isAICombo
                ? "bg-violet-50/80 border-violet-200"
                : "bg-white/80 border-indigo-100"
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
            <div className="w-px h-3 bg-indigo-200" />
            <div className="flex gap-6 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(50%+12px)] h-px bg-indigo-200" />
              <div className="flex flex-col items-center">
                {buildNode(combo.elementA, depth + 1)}
              </div>
              <div className="flex flex-col items-center">
                {buildNode(combo.elementB, depth + 1)}
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="min-w-[240px] p-4 flex justify-center">
        {buildNode(selectedElementId)}
      </div>
    </div>
  );
};