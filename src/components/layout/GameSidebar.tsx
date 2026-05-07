"use client";

import { useGameStore } from '@/store/gameStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryPanel } from '@/components/game/InventoryPanel';
import { ElementDetail } from '@/components/game/ElementDetail';
import { DiscoveryFeed } from '@/components/game/DiscoveryFeed';
import { DiscoveryTree } from '@/components/game/DiscoveryTree';
import { GlassCard } from '@/components/ui/GlassCard';
import { Package, TreePine, Radio } from 'lucide-react';

export const GameSidebar = () => {
  const { sidebarTab, setSidebarTab, selectedElementId } = useGameStore();
  
  return (
    <GlassCard className="h-full flex flex-col overflow-hidden">
      <Tabs value={sidebarTab} onValueChange={(v) => setSidebarTab(v as 'inventory' | 'tree' | 'feed')} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-3 bg-indigo-100/40 p-1 h-10">
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
        </div>
      </Tabs>
    </GlassCard>
  );
};