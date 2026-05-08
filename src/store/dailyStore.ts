import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyChallenge } from '@/types/game';
import { ORIGIN_PACKS, getElementById } from '@/lib/gameData';

function hashString(str: string): number {
  let h1 = 1779033703, h2 = 3144134277;
  for (let i = 0; i < str.length; i++) {
    const k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h1 ^ Math.imul(h2 ^ k, 2869860233);
  }
  return h1 >>> 0;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489909);
    return (s ^= s >>> 16) >>> 0;
  };
}

const DAILY_TARGETS = [
  'house', 'car', 'airplane', 'rainbow', 'flower', 'ocean', 'forest', 'clock', 'glass', 'galaxy',
  'sword', 'train', 'campfire', 'desert', 'island', 'volcano', 'blackhole', 'universe', 'nebula', 'eclipse',
];

function generateDailyChallenge(dateStr: string): DailyChallenge {
  const seed = hashString(dateStr);
  const rng = seededRandom(seed);
  const targetIndex = rng() % DAILY_TARGETS.length;
  const packIndex = rng() % ORIGIN_PACKS.length;
  const pack = ORIGIN_PACKS[packIndex];
  const target = DAILY_TARGETS[targetIndex];
  const maxSteps = 6 + (rng() % 6);

  return {
    date: dateStr,
    seed,
    targetElementId: target,
    startingPackId: pack.id,
    startingElements: [...pack.elements],
    maxSteps,
    hint: `Start with ${pack.name} and create ${getElementById(target)?.name || 'the target'}`,
  };
}

interface DailyState {
  currentChallenge: DailyChallenge | null;
  stepsTaken: number;
  bestScoreToday: number | null;
  completedToday: boolean;
  leaderboard: Array<{ name: string; steps: number; date: string }>;
  initDaily: () => void;
  recordStep: () => void;
  completeDaily: (steps: number) => void;
  resetDaily: () => void;
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      currentChallenge: null,
      stepsTaken: 0,
      bestScoreToday: null,
      completedToday: false,
      leaderboard: [],

      initDaily: () => {
        const today = new Date().toISOString().split('T')[0];
        const { currentChallenge } = get();
        if (currentChallenge?.date === today) return;

        const challenge = generateDailyChallenge(today);
        set({
          currentChallenge: challenge,
          stepsTaken: 0,
          bestScoreToday: null,
          completedToday: false,
        });
      },

      recordStep: () => set((state) => ({ stepsTaken: state.stepsTaken + 1 })),

      completeDaily: (steps) => {
        const { currentChallenge, bestScoreToday, leaderboard } = get();
        if (!currentChallenge) return;
        const newEntry = { name: 'You', steps, date: currentChallenge.date };
        set({
          completedToday: true,
          bestScoreToday: bestScoreToday ? Math.min(bestScoreToday, steps) : steps,
          leaderboard: [...leaderboard, newEntry].sort((a, b) => a.steps - b.steps).slice(0, 10),
        });
      },

      resetDaily: () => {
        set({ stepsTaken: 0, completedToday: false });
      },
    }),
    {
      name: 'aethercraft-daily',
      partialize: (state) => ({
        bestScoreToday: state.bestScoreToday,
        leaderboard: state.leaderboard,
      }),
    }
  )
);