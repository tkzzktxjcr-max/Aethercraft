"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS: Record<string, string> = {
  energy: '#f59e0b',
  liquid: '#3b82f6',
  life: '#22c55e',
  cosmic: '#8b5cf6',
  matter: '#a16207',
  gas: '#06b6d4',
};

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  delay: number;
}

interface Shockwave {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const FusionEffect = () => {
  const fusionEvent = useGameStore((s) => s.fusionEvent);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [shockwaves, setShockwaves] = useState<Shockwave[]>([]);

  useEffect(() => {
    if (!fusionEvent) return;
    const color = TYPE_COLORS[fusionEvent.elementType] || '#8b5cf6';

    const swId = Date.now();
    setShockwaves((prev) => [...prev, { id: swId, x: fusionEvent.x, y: fusionEvent.y, color }]);
    setTimeout(() => {
      setShockwaves((prev) => prev.filter((s) => s.id !== swId));
    }, 900);

    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: Date.now() + i,
      x: fusionEvent.x,
      y: fusionEvent.y,
      angle: (Math.PI * 2 * i) / 40 + Math.random() * 0.4,
      distance: 30 + Math.random() * 120,
      color,
      size: 2 + Math.random() * 6,
      delay: Math.random() * 0.15,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
    return () => clearTimeout(timer);
  }, [fusionEvent]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {shockwaves.map((sw) => (
          <motion.div
            key={sw.id}
            initial={{ x: sw.x, y: sw.y, scale: 0, opacity: 0.7 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute rounded-full border-2"
            style={{
              left: 0, top: 0,
              width: 64,
              height: 64,
              marginLeft: -32,
              marginTop: -32,
              borderColor: sw.color,
              backgroundColor: 'transparent',
              boxShadow: `0 0 30px ${sw.color}40`,
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1.5, opacity: 1 }}
            animate={{
              x: p.x + Math.cos(p.angle) * p.distance,
              y: p.y + Math.sin(p.angle) * p.distance,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: p.delay }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 6}px ${p.color}60`,
              filter: 'blur(0.5px)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
