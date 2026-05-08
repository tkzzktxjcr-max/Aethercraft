import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CanvasOrb, Discovery, GameElement, AIElement, AICombination, AIStatus, FusionEvent, GameMode } from '@/types/game';
import { getElementById, findCombination, ORIGIN_PACKS, ELEMENTS } from '@/lib/gameData';
import { resolveCombination, hydrateAICache, getAIComboKey } from '@/lib/aiCombinations';
import { initAuth } from '@/lib/auth';
import { useProgressionStore } from './progressionStore';
import { playCombineSound, playDiscoverySound, playErrorSound } from '@/lib/audio';
import { showError } from '@/utils/toast';

let idCounter = 0;
const genId = () => `orb_${++idCounter}_${Date.now().toString(36)}`;

// Cooldown tracker to prevent immediate re-combination attempts
const comboCooldowns = new Map<string, number>();
const COOLDOWN_MS = 1200;

function getComboKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

function isOnCooldown(a: string, b: string): boolean {
  const ts = comboCooldowns.get(getComboKey(a, b));
  if (!ts) return false;
  return Date.now() - ts < COOLDOWN_MS;
}

function setCooldown(a: string, b: string) {
  comboCooldowns.set(getComboKey(a, b), Date.now());
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
  triggerFusion: (x: number, y: number, elementType: string) => void;
  setCanvasOrbs: (orbs: CanvasOrb[]) => void;
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

      tryCombine: async (orbAId, orbBId) => {
        const state = get();
        if (state.isGenerating) return { success: false };

        const orbA = state.canvasOrbs.find((o) => o.id === orbAId);
        const orbB = state.canvasOrbs.find((o) => o.id === orbBId);
        if (!orbA || !orbB || orbAId === orbBId) return { success: false };

        // Cooldown check to prevent spam when orbs are close
        if (isOnCooldown(orbA.elementId, orbB.elementId)) {
          return { success: false };
        }

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

        if (state.aiStatus !== 'ready') return { success: false };

        set({ isGenerating: true, generatingElements: [orbA.elementId, orbB.elementId] });

        try {
          const resolved = await resolveCombination(
            orbA.elementId,
            orbB.elementId,
            state.userId || 'guest',
            state.displayName || state.playerName || 'Guest'
          );

          set({ isGenerating: false, generatingElements: null });

          if (!resolved) {
            setCooldown(orbA.elementId, orbB.elementId);
            playErrorSound();
            showError("These elements don't combine");
            return { success: false };
          }

          const { element, isNew } = resolved;
          ELEMENTS[element.id] = element;

          const newOrb: CanvasOrb = {
            id: genId(),
            elementId: element.id,
            x: (orbA.x + orbB.x) / 2,
            y: (orbA.y + orbB.y) / 2,
            isNew: true,
          };

          const discovery: Discovery = {
            id: genId(),
            elementId: element.id,
            elementName: element.name,
            elementEmoji: element.emoji,
            timestamp: Date.now(),
            isFirst: isNew,
            discoverer: element.discovererName || state.displayName || 'You',
          };

          const comboKey = getAIComboKey(orbA.elementId, orbB.elementId);

          const updatedAiElements = element.isAIGenerated
            ? { ...state.aiElements, [element.id]: element as AIElement }
            : state.aiElements;

          set({
            canvasOrbs: [...state.canvasOrbs.filter((o) => o.id !== orbAId && o.id !== orbBId), newOrb],
            discoveredElements: state.discoveredElements.includes(element.id)
              ? state.discoveredElements
              : [...state.discoveredElements, element.id],
            recentDiscoveries: [discovery, ...state.recentDiscoveries].slice(0, 50),
            globalDiscoveries: [discovery, ...state.globalDiscoveries].slice(0, 50),
            selectedElementId: element.id,
            aiElements: updatedAiElements,
            aiCombinations: {
              ...state.aiCombinations,
              [comboKey]: {
                id: comboKey,
                elementA: orbA.elementId,
                elementB: orbB.elementId,
                resultId: element.id,
                discoveredBy: state.userId || 'guest',
                discoveredAt: Date.now(),
                discovererName: state.displayName || 'Guest',
                resultName: element.name,
                resultEmoji: element.emoji,
              },
            },
            fusionEvent: { x: newOrb.x, y: newOrb.y, elementType: element.type, timestamp: Date.now() },
          });

          const progression = useProgressionStore.getState();
          progression.recordDiscovery(isNew, element.isAIGenerated === true);
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

          return { success: true, result: element };
        } catch (e) {
          set({ isGenerating: false, generatingElements: null });
          return { success: false };
        }
      },

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