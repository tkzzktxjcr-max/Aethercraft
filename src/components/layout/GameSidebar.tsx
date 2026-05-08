"use client";

import { useGameStore } from '@/store/gameStore';
import { usePuzzleStore } from '@/store/puzzleStore';
import { useDailyStore } from '@/store/dailyStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryPanel } from '@/components/game/InventoryPanel';
import { ElementDetail } from '@/components/game/ElementDetail';
import { DiscoveryFeed } from '@/components/game/DiscoveryFeed';
import { DiscoveryTree } from '@/components/game/DiscoveryTree';
import { BadgeCollection } from '@/components/game/BadgeCollection';
import { GlassCard } from '@/components/ui/GlassCard';
import { Package, TreePine, Radio, Target, Award } from 'lucide-react';

export const GameSidebar = () => {
  const { sidebarTab, setSidebarTab, selectedElementId, gameMode } = useGameStore();
  const { getCurrentPuzzle } = usePuzzleStore();
  const { currentChallenge } = useDailyStore();

  const puzzle = getCurrentPuzzle();

  return (
    <GlassCard className="h-full flex flex-col overflow-hidden">
      <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as any)} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-4 bg-indigo-100/40 p-1 h-10">
          <TabsTrigger value="inventory" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inv.</span>
          </TabsTrigger>
          <TabsTrigger value="tree" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <TreePine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tree</span>
          </TabsTrigger>
          <TabsTrigger value="feed" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Feed</span>
          </TabsTrigger>
          <TabsTrigger value="quests" className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Target className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quests</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden p-3">
          <TabsContent value="inventory" className="h-full mt-0 data-[state=inactive]:hidden">
            <InventoryPanel />
          </TabsContent>
          <TabsContent value="tree" className="h-full mt-0 data-[state=inactive]:hidden">
            {selectedElementId ? <DiscoveryTree /> : <ElementDetail />}
          </TabsContent>
          <TabsContent value="feed" className="h-full mt-0 data-[state=inactive]:hidden">
            <DiscoveryFeed />
          </TabsContent>
          <TabsContent value="quests" className="h-full mt-0 data-[state=inactive]:hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-indigo-900">Badges</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <BadgeCollection />
              </div>
              {puzzle && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70 mb-1">Active Puzzle</p>
                  <p className="text-xs font-semibold text-indigo-900">{puzzle.name}</p>
                  <p className="text-[10px] text-indigo-900/50">{puzzle.description}</p>
                </div>
              )}
              {currentChallenge && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/70 mb-1">Daily Challenge</p>
                  <p className="text-xs font-semibold text-indigo-900">{currentChallenge.hint}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </GlassCard>
  );
};