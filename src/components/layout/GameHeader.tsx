"use client";

import { useGameStore } from '@/store/gameStore';
import { useProgressionStore } from '@/store/progressionStore';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { AIStatusBadge } from '@/components/ai/AIStatusBadge';
import { ProgressionBar } from '@/components/game/ProgressionBar';
import { Search, User, FlaskConical, RotateCcw, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GameHeader = () => {
  const { playerName, discoveredElements, currentPackId, resetGame, displayName, gameMode, setGameMode } = useGameStore();
  const { checkAndUpdateStreak } = useProgressionStore();
  const navigate = useNavigate();
  const packName = currentPackId
    ? currentPackId.charAt(0).toUpperCase() + currentPackId.slice(1)
    : 'None';

  const modeLabels: Record<string, string> = {
    sandbox: 'Sandbox',
    puzzle: 'Puzzle',
    daily: 'Daily',
    versus: 'Versus',
  };

  const modeColors: Record<string, string> = {
    sandbox: 'bg-violet-100 text-violet-700',
    puzzle: 'bg-amber-100 text-amber-700',
    daily: 'bg-emerald-100 text-emerald-700',
    versus: 'bg-rose-100 text-rose-700',
  };

  return (
    <GlassCard className="h-14 px-4 flex items-center gap-4 shrink-0 rounded-none border-x-0 border-t-0">
      <div className="flex items-center gap-2 shrink-0">
        <FlaskConical className="w-5 h-5 text-violet-600" />
        <h1 className="font-bold text-indigo-900 text-lg hidden sm:block">AetherCraft</h1>
      </div>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <Input
            placeholder="Search elements..."
            className="pl-9 h-9 bg-white/50 border-indigo-100 text-sm"
            disabled
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-indigo-900/70 shrink-0">
        <ProgressionBar />

        <button
          onClick={() => setGameMode(gameMode === 'sandbox' ? 'puzzle' : 'sandbox')}
          className={[
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors",
            modeColors[gameMode] || 'bg-gray-100 text-gray-500'
          ].join(' ')}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          {modeLabels[gameMode] || 'Sandbox'}
        </button>

        <AIStatusBadge />

        <span className="hidden md:inline">
          Pack: <span className="font-semibold text-indigo-900">{packName}</span>
        </span>
        <span className="hidden md:inline font-medium">
          {discoveredElements.length}{' '}
          <span className="text-indigo-900/50">discoveries</span>
        </span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 text-violet-800">
          <User className="w-3.5 h-3.5" />
          <span className="font-semibold text-xs">{displayName || playerName || 'Guest'}</span>
        </div>
        <button
          onClick={() => {
            resetGame();
            navigate('/');
          }}
          className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 hover:text-indigo-700 transition-colors"
          title="Reset game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};