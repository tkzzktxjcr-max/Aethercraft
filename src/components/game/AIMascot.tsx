"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, Lightbulb, Wand2 } from 'lucide-react';

interface MascotState {
  mood: 'idle' | 'thinking' | 'happy' | 'surprised' | 'sad' | 'celebrating';
  message: string | null;
  showHint: boolean;
}

const HINTS = [
  "Try combining fire with something solid!",
  "Water + earth often creates something organic...",
  "Don't forget to check the discovery tree for hints!",
  "Some elements combine with themselves!",
  "Look for hidden patterns in element types.",
  "The cosmos holds many secrets...",
  "Try mixing opposites — they often surprise!",
  "Keep experimenting! The AI loves weird combos.",
];

function getEmojiForMood(mood: MascotState['mood']): string {
  switch (mood) {
    case 'thinking': return '🤔';
    case 'happy': return '😊';
    case 'surprised': return '😮';
    case 'sad': return '😢';
    case 'celebrating': return '🥳';
    default: return '✨';
  }
}

function getGlowColor(mood: MascotState['mood']): string {
  switch (mood) {
    case 'thinking': return 'bg-blue-400';
    case 'happy': return 'bg-emerald-400';
    case 'surprised': return 'bg-amber-400';
    case 'sad': return 'bg-slate-400';
    case 'celebrating': return 'bg-violet-400';
    default: return 'bg-indigo-300';
  }
}

export const AIMascot = () => {
  const { isGenerating, recentDiscoveries } = useGameStore();
  const [mascot, setMascot] = useState<MascotState>({
    mood: 'idle',
    message: null,
    showHint: false,
  });
  const [bounce, setBounce] = useState(0);
  const [hintCooldown, setHintCooldown] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setMascot((prev) => ({ ...prev, mood: 'thinking', message: "I'm mixing the cosmos for you..." }));
    } else if (mascot.mood === 'thinking') {
      setMascot((prev) => ({ ...prev, mood: 'idle', message: null }));
    }
  }, [isGenerating]);

  useEffect(() => {
    if (recentDiscoveries.length === 0) return;
    const latest = recentDiscoveries[0];
    if (!latest) return;

    const now = Date.now();
    if (now - latest.timestamp < 3000) {
      if (latest.isFirst) {
        setMascot({
          mood: 'celebrating',
          message: `First Discovery! ${latest.elementEmoji} ${latest.elementName} — amazing!`,
          showHint: false,
        });
      } else {
        setMascot({
          mood: 'happy',
          message: `You forged ${latest.elementEmoji} ${latest.elementName}!`,
          showHint: false,
        });
      }
      setBounce((prev) => prev + 1);
      const timer = setTimeout(() => {
        setMascot((prev) => ({ ...prev, mood: 'idle', message: null }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [recentDiscoveries]);

  const showRandomHint = () => {
    if (hintCooldown) return;
    const hint = HINTS[Math.floor(Math.random() * HINTS.length)];
    setMascot((prev) => ({ ...prev, mood: 'idle', message: hint, showHint: true }));
    setHintCooldown(true);
    setTimeout(() => {
      setMascot((prev) => ({ ...prev, message: null, showHint: false }));
      setTimeout(() => setHintCooldown(false), 5000);
    }, 5000);
  };

  return (
    <motion.div
      className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <AnimatePresence>
        {mascot.message && (
          <motion.div
            key={mascot.message}
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="mb-2 max-w-[220px]"
          >
            <div className="bg-white/90 backdrop-blur-md rounded-2xl rounded-br-sm px-4 py-3 shadow-lg border border-indigo-100">
              <div className="flex items-start gap-2">
                {mascot.mood === 'thinking' ? (
                  <Wand2 className="w-4 h-4 text-violet-500 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '2s' }} />
                ) : mascot.mood === 'celebrating' ? (
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <p className="text-xs font-medium text-indigo-900 leading-relaxed">{mascot.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={showRandomHint}
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg cursor-pointer hover:scale-110 transition-transform"
        style={{
          background: 'linear-gradient(135deg, hsl(270, 80%, 65%), hsl(280, 70%, 55%))',
          boxShadow: '0 0 20px hsl(270, 80%, 65%, 0.4), 0 4px 16px rgba(0,0,0,0.15)',
        }}
        animate={{
          y: mascot.mood === 'celebrating' || mascot.mood === 'surprised'
            ? [0, -12, 0, -6, 0]
            : mascot.mood === 'thinking'
            ? [0, -4, 0, -4, 0]
            : [0, -3, 0, -3, 0],
          scale: mascot.mood === 'celebrating' ? [1, 1.15, 1, 1.1, 1] : 1,
        }}
        transition={{
          duration: mascot.mood === 'celebrating' ? 0.8 : 2,
          repeat: mascot.mood === 'idle' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <span className="relative z-10">{getEmojiForMood(mascot.mood)}</span>

        <motion.div
          className={`absolute inset-0 rounded-full ${getGlowColor(mascot.mood)} opacity-30`}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <AnimatePresence>
          {mascot.mood === 'celebrating' && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-amber-300"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, Math.cos((i * Math.PI * 2) / 3) * 30],
                    y: [0, Math.sin((i * Math.PI * 2) / 3) * 30],
                    opacity: [1, 0],
                  }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      <span className="text-[9px] font-bold text-indigo-900/40 mt-1">AI Assistant</span>
    </motion.div>
  );
};