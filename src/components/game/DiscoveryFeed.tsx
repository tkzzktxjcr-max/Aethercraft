"use client";

import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Clock, Globe } from 'lucide-react';

export const DiscoveryFeed = () => {
  const { globalDiscoveries } = useGameStore();

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 pr-3 pb-4">
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <Globe className="w-3.5 h-3.5 text-indigo-900/40" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50">
            Global Discoveries
          </span>
        </div>

        <AnimatePresence initial={false}>
          {globalDiscoveries.map((discovery, index) => (
            <motion.div
              key={discovery.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                delay: index * 0.03,
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              className="p-3 rounded-xl bg-white/60 border border-indigo-100/40 backdrop-blur-sm shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-white/80 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
                  {discovery.elementEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-indigo-900 truncate">
                    {discovery.elementName}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-indigo-900/50">
                    <span>by {discovery.discoverer}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(discovery.timestamp)}
                    </span>
                  </div>
                </div>
                {discovery.isFirst && (
                  <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    First
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {globalDiscoveries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-indigo-900/30 gap-2">
            <Sparkles className="w-6 h-6 opacity-40" />
            <p className="text-sm">No discoveries yet</p>
            <p className="text-xs">Start combining elements!</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};