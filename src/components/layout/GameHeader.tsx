"use client";

import { useGameStore } from '@/store/gameStore';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Search, User, FlaskConical, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GameHeader = () => {
  const { playerName, discoveredElements, currentPackId, resetGame } = useGameStore();
  const navigate = useNavigate();
  const packName = currentPackId 
    ? currentPackId.charAt(0).toUpperCase() + currentPackId.slice(1) 
    : 'None';
  
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
        <span className="hidden md:inline">
          Pack: <span className="font-semibold text-indigo-900">{packName}</span>
        </span>
        <span className="hidden md:inline font-medium">
          {discoveredElements.length} <span className="text-indigo-900/50">discoveries</span>
        </span>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-100 text-violet-800">
          <User className="w-3.5 h-3.5" />
          <span className="font-semibold text-xs">{playerName || 'Guest'}</span>
        </div>
        <button
          onClick={() => { resetGame(); navigate('/'); }}
          className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 hover:text-indigo-700 transition-colors"
          title="Reset game"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};