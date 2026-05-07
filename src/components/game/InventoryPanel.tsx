"use client";

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getElementById } from '@/lib/gameData';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIBadge } from '@/components/ai/AIBadge';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export const InventoryPanel = () => {
  const { discoveredElements, addOrb, selectElement } = useGameStore();
  const [search, setSearch] = useState('');

  const elements = discoveredElements
    .map((id) => getElementById(id))
    .filter((el): el is NonNullable<typeof el> => !!el)
    .filter(
      (el) =>
        search === '' ||
        el.name.toLowerCase().includes(search.toLowerCase()) ||
        el.properties.some((p) => p.includes(search.toLowerCase()))
    );

  const byType = elements.reduce(
    (acc, el) => {
      acc[el.type] = acc[el.type] || [];
      acc[el.type].push(el);
      return acc;
    },
    {} as Record<string, typeof elements>
  );

  const typeOrder = ['energy', 'liquid', 'life', 'matter', 'gas', 'cosmic'];

  return (
    <div className="flex flex-col h-full">
      <Input
        placeholder="Search elements..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3 bg-white/50 border-indigo-100 text-sm h-9"
      />
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-3 pb-4">
          {typeOrder.map((type) => {
            const items = byType[type];
            if (!items || items.length === 0) return null;
            return (
              <div key={type}>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2 capitalize">
                  {type}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {items.map((el) => (
                    <motion.button
                      key={el.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        addOrb(el.id);
                        selectElement(el.id);
                      }}
                      className="flex flex-col items-center p-2 rounded-xl bg-white/60 hover:bg-white/90 border border-indigo-100/50 transition-colors group relative"
                    >
                      {el.isAIGenerated && (
                        <div className="absolute top-1 left-1">
                          <AIBadge size="sm" />
                        </div>
                      )}
                      <span className="text-2xl leading-none">{el.emoji}</span>
                      <span className="text-[10px] font-semibold text-indigo-900 mt-1 truncate w-full text-center leading-tight">
                        {el.name}
                      </span>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3 text-violet-500" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            );
          })}

          {elements.length === 0 && (
            <p className="text-sm text-indigo-900/40 text-center py-8">
              {search ? 'No elements match your search' : 'No discoveries yet'}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};