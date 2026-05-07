"use client";

import { useGameStore } from '@/store/gameStore';
import { getElementById, getCombinationsForElement, COMBINATIONS } from '@/lib/gameData';
import { PropertyTag } from '@/components/ui/PropertyTag';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Beaker, ArrowRight } from 'lucide-react';

export const ElementDetail = () => {
  const { selectedElementId, discoveredElements, addOrb } = useGameStore();
  
  if (!selectedElementId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-indigo-900/40 text-sm gap-3">
        <Beaker className="w-8 h-8 opacity-30" />
        <p>Select an element to view details</p>
      </div>
    );
  }
  
  const element = getElementById(selectedElementId);
  if (!element) return null;
  
  const knownCombos = getCombinationsForElement(selectedElementId).filter(c => 
    discoveredElements.includes(c.result)
  );
  
  const provenance = COMBINATIONS.find(c => c.result === selectedElementId);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      key={selectedElementId}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-white/80 border border-indigo-100 flex items-center justify-center text-3xl shadow-sm">
          {element.emoji}
        </div>
        <div>
          <h2 className="text-base font-bold text-indigo-900">{element.name}</h2>
          <p className="text-xs text-indigo-900/50 capitalize">{element.type}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2">
          Properties
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {element.properties.map(prop => (
            <PropertyTag key={prop} label={prop} type={element.type} />
          ))}
        </div>
      </div>
      
      {provenance && (
        <div className="mb-4 p-3 rounded-xl bg-violet-50/50 border border-violet-100">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-700/70 mb-2">
            Created From
          </h3>
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const a = getElementById(provenance.elementA);
              const b = getElementById(provenance.elementB);
              return (
                <>
                  <span className="bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">{a?.emoji} {a?.name}</span>
                  <span className="text-indigo-300">+</span>
                  <span className="bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">{b?.emoji} {b?.name}</span>
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-hidden">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2">
          Known Recipes
        </h3>
        <ScrollArea className="h-full">
          <div className="space-y-2 pr-3 pb-4">
            {knownCombos.length === 0 ? (
              <p className="text-sm text-indigo-900/40 py-2">No known recipes yet</p>
            ) : (
              knownCombos.map(combo => {
                const otherId = combo.elementA === selectedElementId ? combo.elementB : combo.elementA;
                const other = getElementById(otherId);
                const result = getElementById(combo.result);
                if (!other || !result) return null;
                return (
                  <button
                    key={combo.id}
                    onClick={() => addOrb(otherId)}
                    className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-white/50 hover:bg-white/80 border border-indigo-100/30 transition-colors text-left group"
                  >
                    <span className="text-lg">{other.emoji}</span>
                    <span className="text-xs font-medium text-indigo-900">{other.name}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-300 mx-1" />
                    <span className="text-lg">{result.emoji}</span>
                    <span className="text-xs font-semibold text-indigo-900">{result.name}</span>
                    <Plus className="w-3 h-3 text-violet-400 opacity-0 group-hover:opacity-100 ml-auto" />
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};

import { Plus } from 'lucide-react';