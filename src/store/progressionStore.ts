import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Badge, PlayerStats } from '@/types/game';

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 3000, 5000, 8000, 12000, 18000];

const LEVEL_TITLES = [
  'Novice Alchemist',
  'Apprentice Alchemist',
  'Adept Alchemist',
  'Journeyman Alchemist',
  'Expert Alchemist',
  'Master Alchemist',
  'Grandmaster Alchemist',
  'Legendary Alchemist',
  'Mythic Alchemist',
  'Transcendent Alchemist',
  'Eternal Alchemist',
];

const ALL_BADGES: Badge[] = [
  { id: 'discover_10', name: 'Novice Alchemist', description: 'Discover 10 elements', emoji: '🧪', condition: 'discoveries', threshold: 10 },
  { id: 'discover_50', name: 'Adept Alchemist', description: 'Discover 50 elements', emoji: '🔬', condition: 'discoveries', threshold: 50 },
  { id: 'discover_100', name: 'Master Alchemist', description: 'Discover 100 elements', emoji: '⚗️', condition: 'discoveries', threshold: 100 },
  { id: 'first_1', name: 'First Contact', description: 'Be the first to discover an element', emoji: '✨', condition: 'first', threshold: 1 },
  { id: 'first_10', name: 'Pioneer', description: 'Be the first to discover 10 elements', emoji: '🚀', condition: 'first', threshold: 10 },
  { id: 'ai_1', name: 'AI Whisperer', description: 'Discover 1 AI-generated element', emoji: '🤖', condition: 'ai', threshold: 1 },
  { id: 'ai_20', name: 'Machine Mage', description: 'Discover 20 AI-generated elements', emoji: '🧠', condition: 'ai', threshold: 20 },
  { id: 'puzzle_1', name: 'Puzzle Solver', description: 'Solve 1 puzzle', emoji: '🧩', condition: 'puzzle', threshold: 1 },
  { id: 'puzzle_10', name: 'Enigma Master', description: 'Solve 10 puzzles', emoji: '🏆', condition: 'puzzle', threshold: 10 },
  { id: 'daily_1', name: 'Daily Devotee', description: 'Complete 1 daily challenge', emoji: '📅', condition: 'daily', threshold: 1 },
  { id: 'streak_3', name: 'Streak Keeper', description: '3-day play streak', emoji: '🔥', condition: 'streak', threshold: 3 },
  { id: 'streak_7', name: 'Unstoppable', description: '7-day play streak', emoji: '⚡', condition: 'streak', threshold: 7 },
];

interface ProgressionState {
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  streak: number;
  lastPlayDate: string;
  badges: string[];
  stats: PlayerStats;
  newlyUnlocked: string[];
  addXp: (amount: number) => void;
  recordDiscovery: (isFirst: boolean, isAI: boolean) => void;
  recordPuzzleSolved: () => void;
  recordDailyCompleted: () => void;
  checkAndUpdateStreak: () => void;
  syncBadges: () => void;
  getUnlockedBadges: () => Badge[];
  clearNewlyUnlocked: () => void;
}

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      levelTitle: LEVEL_TITLES[0],
      nextLevelXp: LEVEL_THRESHOLDS[1],
      streak: 0,
      lastPlayDate: '',
      badges: [],
      stats: {
        totalDiscoveries: 0,
        aiDiscoveries: 0,
        firstDiscoveries: 0,
        puzzlesSolved: 0,
        dailyChallengesCompleted: 0,
        longestStreak: 0,
        fastestPuzzleTime: Infinity,
      },
      newlyUnlocked: [],

      addXp: (amount) => {
        set((state) => {
          const newXp = state.xp + amount;
          let newLevel = state.level;
          while (newLevel < LEVEL_THRESHOLDS.length && newXp >= LEVEL_THRESHOLDS[newLevel]) {
            newLevel++;
          }
          const nextXp = LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;
          return {
            xp: newXp,
            level: newLevel,
            levelTitle: LEVEL_TITLES[newLevel - 1] || LEVEL_TITLES[LEVEL_TITLES.length - 1],
            nextLevelXp: nextXp,
          };
        });
      },

      recordDiscovery: (isFirst, isAI) => {
        const { addXp } = get();
        let xp = 10;
        if (isFirst) xp += 20;
        if (isAI) xp += 30;
        addXp(xp);
        set((state) => ({
          stats: {
            ...state.stats,
            totalDiscoveries: state.stats.totalDiscoveries + 1,
            firstDiscoveries: state.stats.firstDiscoveries + (isFirst ? 1 : 0),
            aiDiscoveries: state.stats.aiDiscoveries + (isAI ? 1 : 0),
          },
        }));
      },

      recordPuzzleSolved: () => {
        const { addXp } = get();
        addXp(50);
        set((state) => ({
          stats: {
            ...state.stats,
            puzzlesSolved: state.stats.puzzlesSolved + 1,
          },
        }));
      },

      recordDailyCompleted: () => {
        const { addXp } = get();
        addXp(75);
        set((state) => ({
          stats: {
            ...state.stats,
            dailyChallengesCompleted: state.stats.dailyChallengesCompleted + 1,
          },
        }));
      },

      checkAndUpdateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastPlayDate, stats } = get();
        if (lastPlayDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        if (lastPlayDate === yesterdayStr) {
          newStreak = get().streak + 1;
        }

        set({
          streak: newStreak,
          lastPlayDate: today,
          stats: {
            ...stats,
            longestStreak: Math.max(stats.longestStreak, newStreak),
          },
        });
      },

      getUnlockedBadges: () => {
        const { stats, badges } = get();
        return ALL_BADGES.filter((b) => {
          if (badges.includes(b.id)) return true;
          let value = 0;
          switch (b.condition) {
            case 'discoveries': value = stats.totalDiscoveries; break;
            case 'first': value = stats.firstDiscoveries; break;
            case 'ai': value = stats.aiDiscoveries; break;
            case 'puzzle': value = stats.puzzlesSolved; break;
            case 'daily': value = stats.dailyChallengesCompleted; break;
            case 'streak': value = get().streak; break;
          }
          return value >= b.threshold;
        });
      },

      syncBadges: () => {
        const newlyUnlocked = get().getUnlockedBadges().filter((b) => !get().badges.includes(b.id));
        if (newlyUnlocked.length > 0) {
          set((state) => ({
            badges: [...state.badges, ...newlyUnlocked.map((b) => b.id)],
            newlyUnlocked: [...state.newlyUnlocked, ...newlyUnlocked.map((b) => b.id)],
          }));
        }
      },

      clearNewlyUnlocked: () => set({ newlyUnlocked: [] }),
    }),
    {
      name: 'aethercraft-progression',
    }
  )
);

export { ALL_BADGES };