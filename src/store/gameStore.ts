import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CanvasOrb, Discovery, GameElement } from '@/types/game';
import { getElementById, findCombination, ORIGIN_PACKS } from '@/lib/gameData';

let idCounter = 0;
const genId = () => `orb_${++idCounter}_${Date.now().toString(36)}`;

interface GameState {
  playerName: string;
  currentPackId: string | null;
  discoveredElements: string[];
  canvasOrbs: CanvasOrb[];
  selectedElementId: string | null;
  recentDiscoveries: Discovery[];
  sidebarTab: 'inventory' | 'tree' | 'feed';
  
  setPlayerName: (name: string) => void;
  selectPack: (packId: string) => void;
  addOrb: (elementId: string, x?: number, y?: number) => void;
  removeOrb: (orbId: string) => void;
  moveOrb: (orbId: string, x: number, y: number) => void;
  tryCombine: (orbAId: string, orbBId: string) => { success: boolean; result?: GameElement };
  selectElement: (elementId: string | null) => void;
  setSidebarTab: (tab: 'inventory' | 'tree' | 'feed') => void;
  restoreSession: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: '',
      currentPackId: null,
      discoveredElements: [],
      canvasOrbs: [],
      selectedElementId: null,
      recentDiscoveries: [],
      sidebarTab: 'inventory',
      
      setPlayerName: (name) => set({ playerName: name }),
      
      selectPack: (packId) => {
        const pack = ORIGIN_PACKS.find(p => p.id === packId);
        if (!pack) return;
        const starters = pack.elements;
        set({
          currentPackId: packId,
          discoveredElements: starters,
          canvasOrbs: starters.map((elId, i) => ({
            id: genId(),
            elementId: elId,
            x: 320 + i * 100,
            y: 280,
            isNew: false,
          })),
          selectedElementId: null,
          recentDiscoveries: [],
        });
      },
      
      addOrb: (elementId, x, y) => {
        const orb: CanvasOrb = {
          id: genId(),
          elementId,
          x: x ?? 350 + Math.random() * 80,
          y: y ?? 350 + Math.random() * 80,
          isNew: false,
        };
        set(state => ({ canvasOrbs: [...state.canvasOrbs, orb] }));
      },
      
      removeOrb: (orbId) => {
        set(state => ({ canvasOrbs: state.canvasOrbs.filter(o => o.id !== orbId) }));
      },
      
      moveOrb: (orbId, x, y) => {
        set(state => ({
          canvasOrbs: state.canvasOrbs.map(o => o.id === orbId ? { ...o, x, y } : o),
        }));
      },
      
      tryCombine: (orbAId, orbBId) => {
        const state = get();
        const orbA = state.canvasOrbs.find(o => o.id === orbAId);
        const orbB = state.canvasOrbs.find(o => o.id === orbBId);
        if (!orbA || !orbB || orbAId === orbBId) return { success: false };
        
        const resultId = findCombination(orbA.elementId, orbB.elementId);
        if (!resultId) return { success: false };
        
        const resultElement = getElementById(resultId);
        if (!resultElement) return { success: false };
        
        const isNew = !state.discoveredElements.includes(resultId);
        
        const newOrb: CanvasOrb = {
          id: genId(),
          elementId: resultId,
          x: (orbA.x + orbB.x) / 2,
          y: (orbA.y + orbB.y) / 2,
          isNew: true,
        };
        
        const discovery: Discovery = {
          id: genId(),
          elementId: resultId,
          elementName: resultElement.name,
          elementEmoji: resultElement.emoji,
          timestamp: Date.now(),
          isFirst: true,
          discoverer: state.playerName || 'You',
        };
        
        set({
          canvasOrbs: [
            ...state.canvasOrbs.filter(o => o.id !== orbAId && o.id !== orbBId),
            newOrb,
          ],
          discoveredElements: isNew 
            ? [...state.discoveredElements, resultId]
            : state.discoveredElements,
          recentDiscoveries: [discovery, ...state.recentDiscoveries].slice(0, 50),
          selectedElementId: resultId,
        });
        
        // Clear isNew flag after animation
        setTimeout(() => {
          set(s => ({
            canvasOrbs: s.canvasOrbs.map(o => 
              o.id === newOrb.id ? { ...o, isNew: false } : o
            ),
          }));
        }, 2000);
        
        return { success: true, result: resultElement };
      },
      
      selectElement: (id) => set({ selectedElementId: id }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),
      
      restoreSession: () => {
        const state = get();
        if (state.currentPackId && state.canvasOrbs.length === 0) {
          const pack = ORIGIN_PACKS.find(p => p.id === state.currentPackId);
          if (pack) {
            set({
              canvasOrbs: pack.elements.map((elId, i) => ({
                id: genId(),
                elementId: elId,
                x: 320 + i * 100,
                y: 280,
                isNew: false,
              })),
            });
          }
        }
      },
      
      resetGame: () => set({
        discoveredElements: [],
        canvasOrbs: [],
        selectedElementId: null,
        recentDiscoveries: [],
        currentPackId: null,
      }),
    }),
    {
      name: 'aethercraft-storage',
      partialize: (state) => ({
        playerName: state.playerName,
        discoveredElements: state.discoveredElements,
        currentPackId: state.currentPackId,
        recentDiscoveries: state.recentDiscoveries,
      }),
    }
  )
);