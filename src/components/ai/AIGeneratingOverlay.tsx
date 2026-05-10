import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";
import { getElementById } from "@/lib/gameData";
import { Sparkles } from "lucide-react";

export const AIGeneratingOverlay = () => {
  const { isGenerating, generatingElements } = useGameStore();

  const a = generatingElements?.[0];
  const b = generatingElements?.[1];
  const elA = a ? getElementById(a) : null;
  const elB = b ? getElementById(b) : null;

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-full px-5 py-2.5 shadow-lg border border-indigo-100/60 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-lg animate-bounce">{elA?.emoji || "?"}</span>
              <span className="text-xs text-indigo-300">+</span>
              <span className="text-lg animate-bounce" style={{ animationDelay: "0.15s" }}>{elB?.emoji || "?"}</span>
            </div>
            <div className="w-4 h-4 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
            <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-500" />
              The AI is thinking...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
