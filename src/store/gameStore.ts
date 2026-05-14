import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CanvasOrb, Discovery, GameElement, AIElement, AICombination, AIStatus, FusionEvent, GameMode } from '@/types/game';
import { getElementById, findCombination, ORIGIN_PACKS, ELEMENTS } from '@/lib/gameData';
import { resolveCombination, hydrateAICache, getAIComboKey } from '@/lib/aiCombinations';
import { generateElementStream, type OnProgress } from '@/lib/ai/apiGenerator';
import { initAuth } from '@/lib/auth';
import { useProgressionStore } from './progressionStore';
import { playCombineSound, playDiscoverySound } from '@/lib/audio';

let idCounter = 0;
const genId = () => `orb_${++idCounter}_${Date.now().toString(36)}`;

interface GeneratingOrb {
  id: string;
  elementIds: [string, string];
  progress: string;
  x: number;
  y: number;
}

interface GameState {
  playerName: string;
  currentPackId: string | null;
  discoveredElements: string[];
  canvasOrbs: CanvasOrb[];
  selectedElementId: string | null;
  recentDiscoveries: Discovery[];
  sidebarTab: 'inventory' | 'tree' | 'feed' | 'quests';
  isGenerating: boolean;
  generatingElements: [string, string] | null;
  generatingOrb: GeneratingOrb | null;
  aiElements: Record<string, AIElement>;
  aiCombinations: Record<string, AICombination>;
  aiStatus: AIStatus;
  userId: string;
  displayName: string;
  isAnonymous: boolean;
  globalDiscoveries: Discovery[];
  gameMode: GameMode;
  fusionEvent: FusionEvent | null;

  setPlayerName: (name: string) => void;
  setUser: (userId: string, displayName: string, isAnonymous: boolean) => void;
  setAIStatus: (status: AIStatus) => void;
  addGlobalDiscovery: (discovery: Discovery) => void;
  initAuth: () => Promise<void>;
  selectPack: (packId: string) => void;
  addOrb: (elementId: string, x?: number, y?: number) => void;
  removeOrb: (orbId: string) => void;
  moveOrb: (orbId: string, x: number, y: number) => void;
  tryCombine: (orbAId: string, orbBId: string) => Promise<{ success: boolean; result?: GameElement }>;
  selectElement: (elementId: string | null) => void;
  setSidebarTab: (tab: 'inventory' | 'tree' | 'feed' | 'quests') => void;
  restoreSession: () => void;
  resetGame: () => void;
  setGameMode: (mode: GameMode) => void;
  triggerFusion: (x: number, y: number, elementType: ElementType) => void;
  setCanvasOrbs: (orbs: CanvasOrb[]) => void;
  updateGeneratingProgress: (progress: string) => void;
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
      isGenerating: false,
      generatingElements: null,
      generatingOrb: null,
      aiElements: {},
      aiCombinations: {},
      aiStatus: 'idle',
      userId: '',
      displayName: '',
      isAnonymous: true,
      globalDiscoveries: [],
      gameMode: 'sandbox',
      fusionEvent: null,

      setPlayerName: (name) => set({ playerName: name }),
      setUser: (userId, displayName, isAnonymous) => set({ userId, displayName, isAnonymous }),
      setAIStatus: (status) => set({ aiStatus: status }),
      addGlobalDiscovery: (discovery) =>
        set((state) => ({
          globalDiscoveries: [discovery, ...state.globalDiscoveries].slice(0, 50),
        })),

      initAuth: async () => {
        const profile = await initAuth();
        if (profile) {
          set({
            userId: profile.userId,
            displayName: profile.displayName,
            isAnonymous: profile.isAnonymous,
            playerName: profile.displayName,
          });
        }
      },

      selectPack: (packId) => {
        const pack = ORIGIN_PACKS.find((p) => p.id === packId);
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
          gameMode: 'sandbox',
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
        set((state) => ({ canvasOrbs: [...state.canvasOrbs, orb] }));
      },

      removeOrb: (orbId) => {
        set((state) => ({ canvasOrbs: state.canvasOrbs.filter((o) => o.id !== orbId) }));
      },

      moveOrb: (orbId, x, y) => {
        set((state) => ({
          canvasOrbs: state.canvasOrbs.map((o) => (o.id === orbId ? { ...o, x, y } : o)),
        }));
      },

      updateGeneratingProgress: (progress) => {
        set((state) => ({
          generatingOrb: state.generatingOrb ? { ...state.generatingOrb, progress } : null,
        }));
      },

      tryCombine: async (orbAId, orbBId) => {
        const state = get();

        const orbA = state.canvasOrbs.find((o) => o.id === orbAId);
        const orbB = state.canvasOrbs.find((o) => o.id === orbBId);
        if (!orbA || !orbB || orbAId === orbBId) return { success: false };

        const resultId = findCombination(orbA.elementId, orbB.elementId);

        if (resultId) {
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
            isFirst: isNew,
            discoverer: state.displayName || state.playerName || 'You',
          };

          set({
            canvasOrbs: [...state.canvasOrbs.filter((o) => o.id !== orbAId && o.id !== orbBId), newOrb],
            discoveredElements: isNew ? [...state.discoveredElements, resultId] : state.discoveredElements,
            recentDiscoveries: [discovery, ...state.recentDiscoveries].slice(0, 50),
            globalDiscoveries: [discovery, ...state.globalDiscoveries].slice(0, 50),
            selectedElementId: resultId,
            fusionEvent: { x: newOrb.x, y: newOrb.y, elementType: resultElement.type, timestamp: Date.now() },
          });

          const progression = useProgressionStore.getState();
          progression.recordDiscovery(isNew, false);
          progression.syncBadges();

          if (isNew) {
            playDiscoverySound();
          } else {
            playCombineSound();
          }

          setTimeout(() => {
            set((s) => ({
              canvasOrbs: s.canvasOrbs.map((o) => (o.id === newOrb.id ? { ...o, isNew: false } : o)),
              fusionEvent: null,
            }));
          }, 2000);

          return { success: true, result: resultElement };
        }

        // AI fallback: create a placeholder orb immediately so the player can keep playing
        const generatingOrbId = `gen_${Date.now()}`;
        const placeholderOrb: CanvasOrb = {
          id: generatingOrbId,
          elementId: 'generating',
          x: (orbA.x + orbB.x) / 2,
          y: (orbA.y + orbB.y) / 2,
          isNew: false,
          isGenerating: true,
        };

        set((s) => ({
          canvasOrbs: [...s.canvasOrbs.filter((o) => o.id !== orbAId && o.id !== orbBId), placeholderOrb],
          isGenerating: true,
          generatingElements: [orbA.elementId, orbB.elementId],
          generatingOrb: {
            id: generatingOrbId,
            elementIds: [orbA.elementId, orbB.elementId],
            progress: 'The AI is thinking...',
            x: placeholderOrb.x,
            y: placeholderOrb.y,
          },
        }));

        const elA = getElementById(orbA.elementId);
        const elB = getElementById(orbB.elementId);
        if (!elA || !elB) return { success: false };

        const onProgress: OnProgress = (partialText) => {
          const short = partialText.slice(0, 60).replace(/\n/g, ' ');
          get().updateGeneratingProgress(short);
        };

        try {
          const generated = await generateElementStream(elA, elB, onProgress);

          if (!generated) {
            set((s) => ({
              canvasOrbs: s.canvasOrbs.filter((o) => o.id !== generatingOrbId),
              isGenerating: false,
              generatingElements: null,
              generatingOrb: null,
            }));
            return { success: false };
          }

          let resultElement: GameElement | null = getElementById(generated.name);
          if (!resultElement) {
            resultElement = {
              id: getAIComboKey(orbA.elementId, orbB.elementId),
              name: generated.name,
              emoji: generated.emoji,
              type: generated.type as any,
              properties: ['ai-generated'],
              isAIGenerated: true,
              createdBy: state.userId || 'guest',
              createdAt: Date.now(),
              discovererName: state.displayName || 'Guest',
            } as AIElement;
          }

          const discoveredId = resultElement.id;
          const isNew = !state.discoveredElements.includes(discoveredId);

          const finalOrb: CanvasOrb = {
            id: genId(),
            elementId: discoveredId,
            x: (orbA.x + orbB.x) / 2,
            y: (orbA.y + orbB.y) / 2,
            isNew: true,
          };

          const discovery: Discovery = {
            id: genId(),
            elementId: discoveredId,
            elementName: resultElement.name,
            elementEmoji: resultElement.emoji,
            timestamp: Date.now(),
            isFirst: isNew,
            discoverer: state.displayName || 'You',
          };

          const comboKey = getAIComboKey(orbA.elementId, orbB.elementId);

          set((s) => ({
            canvasOrbs: [
              ...s.canvasOrbs.filter((o) => o.id !== generatingOrbId),
              finalOrb,
            ],
            discoveredElements: isNew
              ? [...s.discoveredElements, discoveredId]
              : s.discoveredElements,
            recentDiscoveries: [discovery, ...s.recentDiscoveries].slice(0, 50),
            globalDiscoveries: [discovery, ...s.globalDiscoveries].slice(0, 50),
            selectedElementId: discoveredId,
            isGenerating: false,
            generatingElements: null,
            generatingOrb: null,
            aiElements: resultElement.isAIGenerated
              ? { ...s.aiElements, [discoveredId]: resultElement as AIElement }
              : s.aiElements,
            aiCombinations: {
              ...s.aiCombinations,
              [comboKey]: {
                id: comboKey,
                elementA: orbA.elementId,
                elementB: orbB.elementId,
                resultId: discoveredId,
                discoveredBy: state.userId || 'guest',
                discoveredAt: Date.now(),
                discovererName: state.displayName || 'Guest',
                resultName: resultElement.name,
                resultEmoji: resultElement.emoji,
              },
            },
            fusionEvent: { x: finalOrb.x, y: finalOrb.y, elementType: resultElement.type, timestamp: Date.now() },
          }));

          const progression = useProgressionStore.getState();
          progression.recordDiscovery(isNew, resultElement.isAIGenerated === true);
          progression.syncBadges();

          if (isNew) {
            playDiscoverySound();
          } else {
            playCombineSound();
          }

          setTimeout(() => {
            set((s2) => ({
              canvasOrbs: s2.canvasOrbs.map((o) => (o.id === finalOrb.id ? { ...o, isNew: false } : o)),
              fusionEvent: null,
            }));
          }, 2000);

          return { success: true, result: resultElement };
        } catch (e) {
          set((s) => ({
            canvasOrbs: s.canvasOrbs.filter((o) => o.id !== generatingOrbId),
            isGenerating: false,
            generatingElements: null,
            generatingOrb: null,
          }));
          return { success: false };
        }
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectElement: (id) => set({ selectedElementId: id }),
      setSidebarTab: (tab) => set({ sidebarTab: tab }),

      restoreSession: () => {
        const state = get();
        hydrateAICache(state.aiElements, state.aiCombinations);

        if (state.currentPackId && state.canvasOrbs.length === 0) {
          const pack = ORIGIN_PACKS.find((p) => p.id === state.currentPackId);
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

      resetGame: () =>
        set({
          discoveredElements: [],
          canvasOrbs: [],
          selectedElementId: null,
          recentDiscoveries: [],
          currentPackId: null,
          globalDiscoveries: [],
          gameMode: 'sandbox',
        }),

      setGameMode: (mode) => {
        set({ gameMode: mode });
        if (mode === 'sandbox' && get().currentPackId) {
          const pack = ORIGIN_PACKS.find((p) => p.id === get().currentPackId);
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

      triggerFusion: (x, y, elementType) => {
        set({ fusionEvent: { x, y, elementType: elementType as any, timestamp: Date.now() } });
        setTimeout(() => set({ fusionEvent: null }), 2000);
      },

      setCanvasOrbs: (orbs) => set({ canvasOrbs: orbs }),
    }),
    {
      name: 'aethercraft-storage',
      partialize: (state) => ({
        playerName: state.playerName,
        discoveredElements: state.discoveredElements,
        currentPackId: state.currentPackId,
        recentDiscoveries: state.recentDiscoveries,
        aiElements: state.aiElements,
        aiCombinations: state.aiCombinations,
        userId: state.userId,
        displayName: state.displayName,
        isAnonymous: state.isAnonymous,
        globalDiscoveries: state.globalDiscoveries,
        gameMode: state.gameMode,
      }),
    }
  )
);
