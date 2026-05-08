"use client";

import { useGameStore } from '@/store/gameStore';
import { getElementById, getCombinationsForElement, COMBINATIONS } from '@/lib/gameData';
import { PropertyTag } from '@/components/ui/PropertyTag';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIBadge } from '@/components/ai/AIBadge';
import { RecipeHints } from './RecipeHints';
import { motion } from 'framer-motion';
import { Beaker, ArrowRight, Sparkles, User } from 'lucide-react';

export const ElementDetail = () => {
  const { selectedElementId, discoveredElements, addOrb, aiCombinations } = useGameStore();

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

  const knownCombos = getCombinationsForElement(selectedElementId).filter((c) =>
    discoveredElements.includes(c.result)
  );

  const aiCombos = Object.values(aiCombinations).filter(
    (c) =>
      (c.elementA === selectedElementId || c.elementB === selectedElementId) &&
      discoveredElements.includes(c.resultId)
  );

  const provenance = COMBINATIONS.find((c) => c.result === selectedElementId);
  const aiProvenance = Object.values(aiCombinations).find(
    (c) => c.resultId === selectedElementId
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      key={selectedElementId}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-white/80 border border-indigo-100 flex items-center justify-center text-3xl shadow-sm relative">
          {element.emoji}
          {element.isAIGenerated && (
            <span className="absolute -top-1 -right-1">
              <AIBadge size="sm" />
            </span>
          )}
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
          {element.properties.map((prop) => (
            <PropertyTag key={prop} label={prop} type={element.type} />
          ))}
        </div>
      </div>

      {element.tags && element.tags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {element.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-medium border border-indigo-100">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {element.isAIGenerated && (
        <div className="mb-4 p-3 rounded-xl bg-violet-50/50 border border-violet-100">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-700/70 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-indigo-900/70">
            <User className="w-3 h-3" />
            <span>
              Discovered by{' '}
              <span className="font-semibold text-indigo-900">
                {element.discovererName || 'Unknown'}
              </span>
            </span>
          </div>
          {element.createdAt && (
            <p className="text-[10px] text-indigo-900/40 mt-1">
              {new Date(element.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {provenance && (
        <div className="mb-4 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2">
            Created From
          </h3>
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const a = getElementById(provenance.elementA);
              const b = getElementById(provenance.elementB);
              return (
                <>
                  <span className="bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">
                    {a?.emoji} {a?.name}
                  </span>
                  <span className="text-indigo-300">+</span>
                  <span className="bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">
                    {b?.emoji} {b?.name}
                  </span>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {aiProvenance && (
        <div className="mb-4 p-3 rounded-xl bg-violet-50/50 border border-violet-100">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-700/70 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Created From (AI)
          </h3>
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const a = getElementById(aiProvenance.elementA);
              const b = getElementById(aiProvenance.elementB);
              return (
                <>
                  <span className="bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">
                    {a?.emoji} {a?.name}
                  </span>
                  <span className="text-indigo-300">+</span>
                  <span className="bg-white/70 px-2 py-1 rounded-lg border border-indigo-100">
                    {b?.emoji} {b?.name}
                  </span>
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
            {[...knownCombos, ...aiCombos].length === 0 ? (
              <p className="text-sm text-indigo-900/40 py-2">No known recipes yet</p>
            ) : (
              <>
                {knownCombos.map((combo) => {
                  const otherId =
                    combo.elementA === selectedElementId ? combo.elementB : combo.elementA;
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
                    </button>
                  );
                })}
                {aiCombos.map((combo) => {
                  const otherId =
                    combo.elementA === selectedElementId ? combo.elementB : combo.elementA;
                  const other = getElementById(otherId);
                  const result = getElementById(combo.resultId);
                  if (!other || !result) return null;
                  return (
                    <button
                      key={`ai-${combo.id}`}
                      onClick={() => addOrb(otherId)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-violet-50/50 hover:bg-violet-50/80 border border-violet-100/30 transition-colors text-left group"
                    >
                      <span className="text-lg">{other.emoji}</span>
                      <span className="text-xs font-medium text-indigo-900">{other.name}</span>
                      <ArrowRight className="w-3 h-3 text-violet-300 mx-1" />
                      <span className="text-lg">{result.emoji}</span>
                      <span className="text-xs font-semibold text-indigo-900">{result.name}</span>
                      <AIBadge size="sm" className="ml-auto" />
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <RecipeHints />
    </motion.div>
  );
};