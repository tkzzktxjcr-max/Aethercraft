import { useEffect } from 'react';
import { getAppwriteClient, APPWRITE_CONFIG } from '@/lib/appwrite';
import { useGameStore } from '@/store/gameStore';
import { showSuccess } from '@/utils/toast';
import type { Discovery } from '@/types/game';

export function useRealtime() {
  const { addGlobalDiscovery, displayName, aiElements, discoveredElements } = useGameStore();

  useEffect(() => {
    const { client } = getAppwriteClient();
    if (!client) return;

    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.aiCombinations}.documents`,
      (response) => {
        if (
          response.events.some((e: string) =>
            e.includes('documents.create')
          )
        ) {
          const payload = response.payload as any;
          if (!payload) return;

          const discovery: Discovery = {
            id: payload.$id || payload.id || `rt_${Date.now()}`,
            elementId: payload.resultId,
            elementName: payload.resultName || 'Unknown',
            elementEmoji: payload.resultEmoji || '❓',
            timestamp: new Date(payload.discoveredAt).getTime(),
            isFirst: true,
            discoverer: payload.discovererName || 'Someone',
          };

          addGlobalDiscovery(discovery);

          if (payload.discovererName && payload.discovererName !== displayName) {
            showSuccess(`${payload.discovererName} discovered ${payload.resultName || 'something new'}!`);
          }
        }
      }
    );

    return () => unsubscribe();
  }, [addGlobalDiscovery, displayName]);
}