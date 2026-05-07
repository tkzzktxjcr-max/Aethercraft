"use client";

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AIGenerationPanel } from './AIGenerationPanel';
import { cn } from '@/lib/utils';
import { Brain, Loader2 } from 'lucide-react';

export const AIStatusBadge = () => {
  const { aiStatus } = useGameStore();
  const [open, setOpen] = useState(false);

  const config = {
    loading: {
      label: 'Chargement...',
      className: 'bg-violet-100 text-violet-700',
      icon: Loader2,
    },
    ready: {
      label: '🧠 IA Prête',
      className: 'bg-emerald-100 text-emerald-700',
      icon: Brain,
    },
    unavailable: {
      label: 'IA Indisponible',
      className: 'bg-gray-100 text-gray-500',
      icon: Brain,
    },
    idle: {
      label: 'IA',
      className: 'bg-gray-100 text-gray-500',
      icon: Brain,
    },
  }[aiStatus] || config.idle;

  return (
    <>
      <button
        onClick={() => aiStatus !== 'unavailable' && setOpen(true)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors',
          config.className
        )}
      >
        <config.icon
          className={cn('w-3.5 h-3.5', aiStatus === 'loading' && 'animate-spin')}
        />
        {config.label}
      </button>
      <AIGenerationPanel open={open} onOpenChange={setOpen} />
    </>
  );
};