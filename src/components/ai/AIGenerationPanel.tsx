"use client";

import { useGameStore } from '@/store/gameStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Database, Clock } from 'lucide-react';

interface AIGenerationPanelProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const AIGenerationPanel = ({ open, onOpenChange }: AIGenerationPanelProps) => {
  const { aiStatus, aiElements, recentDiscoveries, userId } = useGameStore();
  const aiCount = Object.keys(aiElements).length;
  const history = recentDiscoveries.filter((d) => d.elementId.startsWith('ai_'));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[360px] bg-white/80 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-indigo-900">
            <Brain className="w-5 h-5 text-violet-600" />
            🤖 AI Engine
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2">
              Model Status
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <div
                className={[
                  'w-2 h-2 rounded-full',
                  aiStatus === 'ready'
                    ? 'bg-emerald-500'
                    : aiStatus === 'loading'
                      ? 'bg-violet-500 animate-pulse'
                      : 'bg-gray-400',
                ].join(' ')}
              />
              <span className="text-sm font-medium text-indigo-900">
                {aiStatus === 'ready'
                  ? 'Ready'
                  : aiStatus === 'loading'
                    ? 'Downloading model...'
                    : 'Unavailable'}
              </span>
            </div>
            <p className="text-xs text-indigo-900/50">Llama-3.2-1B-Instruct-q4f16_1-MLC</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-indigo-100">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2">
              Discoveries
            </h3>
            <p className="text-2xl font-bold text-indigo-900">
              {aiCount}{' '}
              <span className="text-sm font-normal text-indigo-900/50">AI elements</span>
            </p>
          </div>

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Session History
            </h3>
            <ScrollArea className="h-[200px] rounded-xl border border-indigo-100 bg-white/50 p-2">
              <div className="space-y-2">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-2 py-2 px-2 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <span className="text-lg">{h.elementEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-900 truncate">
                        {h.elementName}
                      </p>
                      <p className="text-[10px] text-indigo-900/50">by {h.discoverer}</p>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-indigo-900/40 py-4 text-center">
                    No AI generations yet
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 rounded-xl bg-white border border-indigo-100">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-indigo-900/50 mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Connection
            </h3>
            <p className="text-xs text-indigo-900/70 truncate">
              User: <span className="font-mono">{userId || 'Not connected'}</span>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};