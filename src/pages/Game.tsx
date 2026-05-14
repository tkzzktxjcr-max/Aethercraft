import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GameHeader } from '@/components/layout/GameHeader';
import { GameSidebar } from '@/components/layout/GameSidebar';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameModeSelector } from '@/components/game/GameModeSelector';
import { PuzzlePanel } from '@/components/game/PuzzlePanel';
import { PuzzleSelector } from '@/components/game/PuzzleSelector';
import { DailyChallenge } from '@/components/game/DailyChallenge';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getElementById } from '@/lib/gameData';
import { useRealtime } from '@/hooks/useRealtime';
import { Sparkles, Puzzle, CalendarDays, Swords } from 'lucide-react';

export default function Game() {
  const { currentPackId, restoreSession, selectedElementId, canvasOrbs, gameMode } = useGameStore();
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showPuzzleSelector, setShowPuzzleSelector] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentPackId) {
      navigate('/');
    } else {
      restoreSession();
    }
  }, [currentPackId, navigate, restoreSession]);

  useRealtime();

  if (!currentPackId) return null;

  const selectedElement = selectedElementId ? getElementById(selectedElementId) : null;

  const modeIcons: Record<string, React.ReactNode> = {
    sandbox: <Sparkles className="w-3 h-3 inline mr-1" />,
    puzzle: <Puzzle className="w-3 h-3 inline mr-1" />,
    daily: <CalendarDays className="w-3 h-3 inline mr-1" />,
    versus: <Swords className="w-3 h-3 inline mr-1" />,
  };

  const modeLabels: Record<string, string> = {
    sandbox: 'Sandbox',
    puzzle: 'Puzzle',
    daily: 'Daily',
    versus: 'Versus',
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[hsl(260,20%,96%)]">
      <GameHeader />
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        <div className="w-[280px] shrink-0 h-full hidden md:block">
          <GameSidebar />
        </div>
        <div className="flex-1 h-full rounded-2xl overflow-hidden border border-indigo-100/60 shadow-xl relative">
          <GameCanvas />

          {/* Mode overlays */}
          {gameMode === 'puzzle' && <PuzzlePanel />}
          {gameMode === 'daily' && <DailyChallenge />}

          {/* Mode selector button - now visible in ALL modes */}
          <button
            onClick={() => {
              if (gameMode === 'puzzle') {
                setShowPuzzleSelector(true);
              } else {
                setShowModeSelector(true);
              }
            }}
            className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-indigo-100/40 text-xs font-semibold text-indigo-900/70 hover:bg-white/90 transition-colors flex items-center"
          >
            {modeIcons[gameMode]}
            {gameMode === 'puzzle' ? 'Select Puzzle' : `Change Mode (${modeLabels[gameMode]})`}
          </button>

          <GameModeSelector open={showModeSelector} onClose={() => setShowModeSelector(false)} />
          <PuzzleSelector open={showPuzzleSelector} onClose={() => setShowPuzzleSelector(false)} />

          <AnimatePresence>
            {selectedElement && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 shadow-lg flex items-center gap-2 pointer-events-none"
              >
                <span className="text-lg">{selectedElement.emoji}</span>
                <span className="text-sm font-semibold text-indigo-900">{selectedElement.name}</span>
                <span className="text-xs text-indigo-900/50 capitalize">({selectedElement.type})</span>
                {selectedElement.isAIGenerated && (
                  <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">
                    ✨ IA
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-indigo-100/40 text-[10px] font-semibold text-indigo-900/50 pointer-events-none">
            {canvasOrbs.length} orbs on canvas
          </div>
        </div>
      </div>
    </div>
  );
}