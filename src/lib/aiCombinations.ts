import { generateElement, initWebLLM } from './webllm';
import { getElementById, ELEMENTS } from './gameData';
import { getAppwriteClient, APPWRITE_CONFIG } from './appwrite';
import type { AIElement, AICombination } from '@/types/game';
import { Permission, Role } from 'appwrite';

const localAICache = new Map<string, AICombination>();
const localElementCache = new Map<string, AIElement>();

// Évite que le même joueur ne lance plusieurs générations pour la même combo
const pendingGenerations = new Set<string>();
const pendingResolvers = new Map<string, Array<(result: { element: AIElement; isNew: boolean } | null) => void>>();

function hashKey(a: string, b: string): string {
  const sorted = [a, b].sort().join('+');
  // FNV-1a hash
  let hash = 0x811c9dc5;
  for (let i = 0; i < sorted.length; i++) {
    hash ^= sorted.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const base36 = (hash >>> 0).toString(36);
  // Prefix with 'c' to ensure starts with letter, pad to 12 chars max
  return `c${base36.padStart(11, '0').slice(0, 20)}`;
}

export function getAIComboKey(a: string, b: string): string {
  return hashKey(a, b);
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

function resolvePending(key: string, result: { element: AIElement; isNew: boolean } | null) {
  const resolvers = pendingResolvers.get(key) || [];
  resolvers.forEach((r) => r(result));
  pendingResolvers.delete(key);
  pendingGenerations.delete(key);
}

function waitForPending(key: string): Promise<{ element: AIElement; isNew: boolean } | null> {
  return new Promise((resolve) => {
    const existing = pendingResolvers.get(key) || [];
    existing.push(resolve);
    pendingResolvers.set(key, existing);
  });
}

export async function resolveCombination(
  a: string,
  b: string,
  userId: string,
  userName: string
): Promise<{ element: AIElement; isNew: boolean } | null> {
  const key = getAIComboKey(a, b);

  // 1. Cache local immédiat
  const localCombo = localAICache.get(key);
  if (localCombo) {
    const el = localElementCache.get(localCombo.resultId);
    if (el) return { element: el, isNew: false };
  }

  // 2. Déjà en cours de génération localement ? On attend le résultat
  if (pendingGenerations.has(key)) {
    return waitForPending(key);
  }

  // 3. Appwrite lookup par ID déterministe (hash court)
  const { databases } = getAppwriteClient();
  if (databases) {
    try {
      const comboDoc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.aiCombinations,
        key
      );
      // Trouvé ! On met en cache et on retourne
      const combo: AICombination = {
        id: comboDoc.$id,
        elementA: comboDoc.elementA,
        elementB: comboDoc.elementB,
        resultId: comboDoc.resultId,
        discoveredBy: comboDoc.discoveredBy,
        discoveredAt: new Date(comboDoc.discoveredAt).getTime(),
        discovererName: comboDoc.discovererName,
        resultName: comboDoc.resultName,
        resultEmoji: comboDoc.resultEmoji,
      };
      localAICache.set(key, combo);

      const elDoc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.aiElements,
        comboDoc.resultId
      ).catch(() => null);

      if (elDoc) {
        const element: AIElement = {
          id: elDoc.$id,
          name: elDoc.name,
          emoji: elDoc.emoji,
          type: elDoc.type as any,
          properties: elDoc.properties || [],
          isAIGenerated: true,
          createdBy: elDoc.createdBy,
          createdAt: new Date(elDoc.createdAt).getTime(),
          discovererName: elDoc.discovererName || comboDoc.discovererName,
        };
        localElementCache.set(element.id, element);
        ELEMENTS[element.id] = element;
        return { element, isNew: false };
      }
    } catch (e: any) {
      // 404 = pas trouvé, c'est normal, on continue
      if (e.code !== 404 && e?.response?.code !== 404) {
        console.error('Appwrite lookup error:', e);
      }
    }
  }

  // 4. On prend le verrou de génération
  pendingGenerations.add(key);

  // 5. Génération WebLLM
  try {
    const engine = await initWebLLM();
    const elA = getElementById(a);
    const elB = getElementById(b);
    if (!elA || !elB) {
      resolvePending(key, null);
      return null;
    }

    const generated = await generateElement(elA, elB, engine);
    const elementId = key; // même hash court que la combinaison

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

    // 6. Sauvegarde atomique dans Appwrite avec ID déterministe (hash court)
    if (databases) {
      try {
        // On essaie d'abord de créer l'élément avec un ID fixe
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.aiElements,
          elementId, // $id déterministe et court !
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
      } catch (e: any) {
        if (e.code === 409 || e?.response?.code === 409) {
          // Un autre joueur a déjà créé cet élément ! On récupère le sien
          const existingEl = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.aiElements,
            elementId
          );
          aiElement.name = existingEl.name;
          aiElement.emoji = existingEl.emoji;
          aiElement.type = existingEl.type;
          aiElement.discovererName = existingEl.discovererName || userName;
        } else {
          console.error('Failed to save AI element:', e);
        }
      }

      try {
        // On essaie de créer la combinaison avec un ID fixe
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.aiCombinations,
          key, // $id déterministe et court !
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
      } catch (e: any) {
        if (e.code === 409 || e?.response?.code === 409) {
          // Un autre joueur a déjà créé cette combinaison ! On récupère la sienne
          const existingCombo = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.aiCombinations,
            key
          );
          aiCombo.resultId = existingCombo.resultId;
          aiCombo.resultName = existingCombo.resultName;
          aiCombo.resultEmoji = existingCombo.resultEmoji;
          aiCombo.discovererName = existingCombo.discovererName || userName;

          // On met aussi à jour notre élément local avec le vrai résultat
          const existingEl = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.aiElements,
            existingCombo.resultId
          ).catch(() => null);

          if (existingEl) {
            aiElement.name = existingEl.name;
            aiElement.emoji = existingEl.emoji;
            aiElement.type = existingEl.type;
            aiElement.discovererName = existingEl.discovererName || userName;
          }
        } else {
          console.error('Failed to save AI combination:', e);
        }
      }
    }

    // 7. Mise en cache local (toujours, même en offline)
    localAICache.set(key, aiCombo);
    localElementCache.set(elementId, aiElement);
    ELEMENTS[elementId] = aiElement;

    const result = { element: aiElement, isNew: true };
    resolvePending(key, result);
    return result;
  } catch (e) {
    console.error('AI generation failed:', e);
    resolvePending(key, null);
    return null;
  }
}