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
}

export const FusionEffect = () => {
  const fusionEvent = useGameStore((s) => s.fusionEvent);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!fusionEvent) return;
    const color = TYPE_COLORS[fusionEvent.elementType] || '#8b5cf6';
    const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: fusionEvent.x,
      y: fusionEvent.y,
      angle: (Math.PI * 2 * i) / 24 + Math.random() * 0.3,
      distance: 40 + Math.random() * 80,
      color,
      size: 3 + Math.random() * 5,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    const timer = setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 800);
    return () => clearTimeout(timer);
  }, [fusionEvent]);

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{
              x: p.x + Math.cos(p.angle) * p.distance,
              y: p.y + Math.sin(p.angle) * p.distance,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};