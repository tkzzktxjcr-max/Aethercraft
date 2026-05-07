import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { OriginPackSelector } from '@/components/game/OriginPackSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, FlaskConical } from 'lucide-react';

export default function Index() {
  const { playerName, setPlayerName } = useGameStore();
  const [step, setStep] = useState<'name' | 'packs'>('name');
  
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, hsl(260, 20%, 96%) 0%, hsl(280, 25%, 92%) 100%)' }}
    >
      {/* Floating ambient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: 180 + i * 40,
              height: 180 + i * 40,
              background: i % 3 === 0 ? 'hsl(270, 80%, 65%)' : i % 3 === 1 ? 'hsl(195, 90%, 55%)' : 'hsl(145, 75%, 45%)',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, 20, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10 + i * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-200 mb-5">
            <FlaskConical className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-900 mb-4 tracking-tight">
            AetherCraft
          </h1>
          <p className="text-lg md:text-xl text-indigo-900/50 max-w-md mx-auto font-medium">
            Discover infinite combinations. Craft your world from pure essence.
          </p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {step === 'name' ? (
            <motion.div
              key="name"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="max-w-sm mx-auto"
            >
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-xl">
                <label className="block text-sm font-semibold text-indigo-900 mb-2">
                  What should we call you?
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name..."
                  className="mb-4 bg-white/60 border-indigo-100 h-11"
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setStep('packs')}
                  autoFocus
                />
                <Button 
                  className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                  disabled={!playerName.trim()}
                  onClick={() => setStep('packs')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="packs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-center text-xl font-bold text-indigo-900 mb-8">
                Choose your Origin
              </h2>
              <OriginPackSelector />
              <button 
                onClick={() => setStep('name')}
                className="block mx-auto mt-8 text-sm text-indigo-900/40 hover:text-indigo-900 font-medium transition-colors"
              >
                ← Change name
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}