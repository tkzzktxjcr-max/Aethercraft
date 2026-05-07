import { generateElement, initWebLLM } from './webllm';
import { getElementById, ELEMENTS } from './gameData';
import { getAppwriteClient, APPWRITE_CONFIG } from './appwrite';
import type { AIElement, AICombination } from '@/types/game';
import { ID, Query } from 'appwrite';

const localAICache = new Map<string, AICombination>();
const localElementCache = new Map<string, AIElement>();

export function getAIComboKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

export function hydrateAICache(
  aiElements: Record<string, AIElement>,
  aiCombinations: Record<string, AICombination>
) {
  Object.values(aiElements).forEach((el) => {
    ELEMENTS[el.id] = el;
    localElementCache.set(el.id, el);
  });
  Object.values(aiCombinations).forEach((combo) => {
    localAICache.set(combo.id, combo);
  });
}

export async function resolveCombination(
  a: string,
  b: string,
  userId: string,
  userName: string
): Promise<{ element: AIElement; isNew: boolean } | null> {
  const key = getAIComboKey(a, b);

  // 1. Local cache
  const localCombo = localAICache.get(key);
  if (localCombo) {
    const el = localElementCache.get(localCombo.resultId);
    if (el) return { element: el, isNew: false };
  }

  // 2. Appwrite lookup
  const { databases } = getAppwriteClient();
  if (databases) {
    try {
      const res = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.aiCombinations,
        [Query.equal('id', key)]
      );
      if (res.documents.length > 0) {
        const doc = res.documents[0];
        const combo: AICombination = {
          id: doc.id,
          elementA: doc.elementA,
          elementB: doc.elementB,
          resultId: doc.resultId,
          discoveredBy: doc.discoveredBy,
          discoveredAt: new Date(doc.discoveredAt).getTime(),
          discovererName: doc.discovererName,
          resultName: doc.resultName,
          resultEmoji: doc.resultEmoji,
        };
        localAICache.set(key, combo);

        const elDoc = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.aiElements,
          doc.resultId
        ).catch(() => null);

        if (elDoc) {
          const element: AIElement = {
            id: elDoc.id,
            name: elDoc.name,
            emoji: elDoc.emoji,
            type: elDoc.type as any,
            properties: elDoc.properties || [],
            isAIGenerated: true,
            createdBy: elDoc.createdBy,
            createdAt: new Date(elDoc.createdAt).getTime(),
            discovererName: elDoc.discovererName || doc.discovererName,
          };
          localElementCache.set(element.id, element);
          ELEMENTS[element.id] = element;
          return { element, isNew: false };
        }
      }
    } catch {
      // Offline or error, continue to generation
    }
  }

  // 3. Generate with WebLLM
  try {
    const engine = await initWebLLM();
    const elA = getElementById(a);
    const elB = getElementById(b);
    if (!elA || !elB) return null;

    const generated = await generateElement(elA, elB, engine);
    const elementId = `ai_${key.replace(/\+/g, '_')}`;

    const aiElement: AIElement = {
      id: elementId,
      name: generated.name,
      emoji: generated.emoji,
      type: generated.type as any,
      properties: ['ai-generated'],
      isAIGenerated: true,
      createdBy: userId,
      createdAt: Date.now(),
      discovererName: userName,
    };

    const aiCombo: AICombination = {
      id: key,
      elementA: a,
      elementB: b,
      resultId: elementId,
      discoveredBy: userId,
      discoveredAt: Date.now(),
      discovererName: userName,
      resultName: aiElement.name,
      resultEmoji: aiElement.emoji,
    };

    localAICache.set(key, aiCombo);
    localElementCache.set(elementId, aiElement);
    ELEMENTS[elementId] = aiElement;

    // 4. Save to Appwrite (fire and forget)
    if (databases) {
      try {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.aiElements,
          ID.unique(),
          {
            id: elementId,
            name: aiElement.name,
            emoji: aiElement.emoji,
            type: aiElement.type,
            properties: aiElement.properties,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            isAIGenerated: true,
            discovererName: userName,
          },
          [Permission.read(Role.any()), Permission.update(Role.user(userId))]
        );

        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.aiCombinations,
          ID.unique(),
          {
            id: key,
            comboKey: key,
            elementA: a,
            elementB: b,
            resultId: elementId,
            resultName: aiElement.name,
            resultEmoji: aiElement.emoji,
            discoveredBy: userId,
            discoveredAt: new Date().toISOString(),
            discovererName: userName,
          },
          [Permission.read(Role.any()), Permission.update(Role.user(userId))]
        );
      } catch {
        // Offline mode, keep local
      }
    }

    return { element: aiElement, isNew: true };
  } catch (e) {
    console.error('AI generation failed:', e);
    return null;
  }
}

import { Permission, Role } from 'appwrite';