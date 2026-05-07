import { useEffect } from 'react';
import { initWebLLM, isWebGPUSupported } from '@/lib/webllm';
import { useGameStore } from '@/store/gameStore';

export function useWebLLM() {
  const { setAIStatus } = useGameStore();

  useEffect(() => {
    if (!isWebGPUSupported()) {
      setAIStatus('unavailable');
      return;
    }

    setAIStatus('loading');

    let cancelled = false;

    initWebLLM((report) => {
      if (cancelled) return;
      if (report.progress === 1) {
        setAIStatus('ready');
      }
    })
      .then(() => {
        if (!cancelled) setAIStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setAIStatus('unavailable');
      });

    return () => {
      cancelled = true;
    };
  }, [setAIStatus]);
}