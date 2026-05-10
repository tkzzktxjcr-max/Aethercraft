import { useEffect } from "react";
import { isWebGPUSupported, ensureWebLLMEngine } from "@/lib/ai/generateElementAI";
import { useGameStore } from "@/store/gameStore";

export function useWebLLM() {
  const { setAIStatus } = useGameStore();

  useEffect(() => {
    if (!isWebGPUSupported()) {
      setAIStatus("unavailable");
      return;
    }

    let cancelled = false;

    // Preload engine in the background so first exotic combo is faster
    setAIStatus("loading");
    ensureWebLLMEngine((report) => {
      if (cancelled) return;
      if (report.progress === 1) {
        setAIStatus("ready");
      } else {
        setAIStatus("loading");
      }
    })
      .then(() => {
        if (!cancelled) setAIStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setAIStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [setAIStatus]);
}
