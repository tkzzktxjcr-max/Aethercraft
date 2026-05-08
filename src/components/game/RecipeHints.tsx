"use client";

import { useGameStore } from '@/store/gameStore';
import { getElementById, COMBINATIONS } from '@/lib/gameData';
import { motion } from 'framer-motion';
import { Lightbulb, Lock } from 'lucide-react';

export const RecipeHints = () => {
  const { selectedElementId, discoveredElements } = useGameStore();

  if (!selectedElementId) return null;

  const possibleCombos = COMBINATIONS.filter(
    (c) =>
      (c.elementA === selectedElementId || c.elementB === selectedElementId) &&
      !discoveredElements.includes(c.result)
  );

  const knownCombos = COMBINATIONS.filter(
    (c) =>
      (c.elementA === selectedElementId || c.elementB === selectedElementId) &&
      discoveredElements.includes(c.result)
  );

  return (
    <div className="mt-4">
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2 flex items-center gap-1">
        <Lightbulb className="w-3.5 h-3.5" />
        Recipe Hints
      </h3>

      <div className="space-y-1.5">
        {knownCombos.map((combo) => {
          const otherId = combo.elementA === selectedElementId ? combo.elementB : combo.elementA;
          const other = getElementById(otherId);
          const result = getElementById(combo.result);
          if (!other || !result) return null;
          return (
            <div key={combo.id} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50 text-xs">
              <span>{other.emoji}</span>
              <span className="text-indigo-900/60">+</span>
              <span>{result.emoji}</span>
              <span className="font-medium text-emerald-700 ml-auto">Known</span>
            </div>
          );
        })}

        {possibleCombos.slice(0, 3).map((combo) => {
          const otherId = combo.elementA === selectedElementId ? combo.elementB : combo.elementA;
          const other = getElementById(otherId);
          const hasOther = discoveredElements.includes(otherId);
          return (
            <motion.div
              key={combo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-100/50 text-xs"
            >
              <span>{other?.emoji || '?'}</span>
              <span className="text-indigo-900/60">+</span>
              <span className="text-amber-700/40">?</span>
              <span className="ml-auto flex items-center gap-1 text-amber-700/60">
                {hasOther ? (
                  <span className="text-[10px]">Try combining!</span>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span className="text-[10px]">Need {other?.name || '?'}</span>
                  </>
                )}
              </span>
            </motion.div>
          );
        })}

        {possibleCombos.length === 0 && knownCombos.length === 0 && (
          <p className="text-xs text-indigo-900/40 py-2">No known recipes for this element</p>
        )}
      </div>
    </div>
  );
};