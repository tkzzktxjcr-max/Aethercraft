import { useEffect } from "react";
import { isWebGPUSupported } from "@/lib/ai/generateElementAI";
import { useGameStore } from "@/store/gameStore";

export function useWebLLM() {
  const { setAIStatus } = useGameStore();

  useEffect(() => {
    if (!isWebGPUSupported()) {
      setAIStatus("unavailable");
      return;
    }
    // Lazily loaded — only initialize when the first exotic combo is requested
    setAIStatus("idle");
  }, [setAIStatus]);
}
