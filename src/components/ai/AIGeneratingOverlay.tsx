"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { getElementById } from "@/lib/gameData";
import { Sparkles } from "lucide-react";

export const AIGeneratingOverlay = () => {
  const { isGenerating, generatingElements, generatingOrb } = useGameStore();

  const a = generatingElements?.[0];
  const b = generatingElements?.[1];
  const elA = a ? getElementById(a) : null;
  const bEl = b ? getElementById(b) : null;
  const progress = generatingOrb?.progress || "The AI is thinking...";

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl px-6 py-3 shadow-2xl border border-indigo-100/80 flex flex-col items-center gap-2 min-w-[240px]">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">{elA?.emoji || "?"}</span>
              <span className="text-sm text-indigo-300">+</span>
              <span className="text-xl animate-bounce" style={{ animationDelay: "0.15s" }}>{bEl?.emoji || "?"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-900 truncate max-w-[180px]">
                {progress}
              </span>
            </div>
            <div className="w-full h-1 bg-indigo-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-violet-500"
                animate={{ width: ["0%", "60%", "30%", "80%", "50%"] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-[10px] text-indigo-900/40 font-medium">
              You can play with other elements while waiting
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
