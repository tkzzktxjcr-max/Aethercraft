import { generateElement, initWebLLM } from './webllm';
import { getElementById, ELEMENTS } from './gameData';
import { getAppwriteClient, APPWRITE_CONFIG } from './appwrite';
import type { AIElement, AICombination, GameElement } from '@/types/game';
import { Permission, Role, Query } from 'appwrite';

const localAICache = new Map<string, AICombination>();
const localElementCache = new Map<string, AIElement>();

const pendingGenerations = new Set<string>();
const pendingResolvers = new Map<string, Array<(result: { element: GameElement; isNew: boolean } | null) => void>>();

function hashKey(a: string, b: string): string {
  const sorted = [a, b].sort().join('+');
  let hash = 0x811c9dc5;
  for (let i = 0; i < sorted.length; i++) {
    hash ^= sorted.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const base36 = (hash >>> 0).toString(36);
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

function resolvePending(key: string, result: { element: GameElement; isNew: boolean } | null) {
  const resolvers = pendingResolvers.get(key) || [];
  resolvers.forEach((r) => r(result));
  pendingResolvers.delete(key);
  pendingGenerations.delete(key);
}

function waitForPending(key: string): Promise<{ element: GameElement; isNew: boolean } | null> {
  return new Promise((resolve) => {
    const existing = pendingResolvers.get(key) || [];
    existing.push(resolve);
    pendingResolvers.set(key, existing);
  });
}

// Cherche un élément par nom (localement uniquement)
function findElementByNameLocal(name: string): GameElement | null {
  const normalized = name.toLowerCase().trim();
  for (const el of localElementCache.values()) {
    if (el.name.toLowerCase().trim() === normalized) return el;
  }
  for (const el of Object.values(ELEMENTS)) {
    if (el.name.toLowerCase().trim() === normalized) return el;
  }
  return null;
}

// Cherche un élément IA par nom dans Appwrite
async function findAIElementByNameInAppwrite(name: string): Promise<AIElement | null> {
  const { databases } = getAppwriteClient();
  if (!databases) return null;
  try {
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.aiElements,
      [Query.equal('name', name)]
    );
    if (result.documents.length > 0) {
      const doc = result.documents[0];
      const element: AIElement = {
        id: doc.$id,
        name: doc.name,
        emoji: doc.emoji,
        type: doc.type as any,
        properties: doc.properties || [],
        isAIGenerated: true,
        createdBy: doc.createdBy,
        createdAt: new Date(doc.createdAt).getTime(),
        discovererName: doc.discovererName,
      };
      localElementCache.set(element.id, element);
      ELEMENTS[element.id] = element;
      return element;
    }
  } catch (e) {
    console.error('Error searching Appwrite for element by name:', e);
  }
  return null;
}

export async function resolveCombination(
  a: string,
  b: string,
  userId: string,
  userName: string
): Promise<{ element: GameElement; isNew: boolean } | null> {
  const key = getAIComboKey(a, b);

  // 1. Cache local immédiat
  const localCombo = localAICache.get(key);
  if (localCombo) {
    const el = localElementCache.get(localCombo.resultId) || ELEMENTS[localCombo.resultId];
    if (el) return { element: el, isNew: false };
  }

  // 2. Déjà en cours de génération localement ?
  if (pendingGenerations.has(key)) {
    return waitForPending(key);
  }

  // 3. Appwrite lookup par ID déterministe
  const { databases } = getAppwriteClient();
  if (databases) {
    try {
      const comboDoc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.aiCombinations,
        key
      );
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

      const el = localElementCache.get(combo.resultId) || ELEMENTS[combo.resultId];
      if (el) return { element: el, isNew: false };

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
      if (e.code !== 404 && e?.response?.code !== 404) {
        console.error('Appwrite lookup error:', e);
      }
    }
  }

  // 4. Verrou de génération
  pendingGenerations.add(key);

  try {
    const engine = await initWebLLM();
    const elA = getElementById(a);
    const elB = getElementById(b);
    if (!elA || !elB) {
      resolvePending(key, null);
      return null;
    }

    const generated = await generateElement(elA, elB, engine);

    // 5. ANTI-DOUBLON : chercher si un élément avec ce nom existe déjà
    let resultElement: GameElement | null = findElementByNameLocal(generated.name);
    let isNewElement = false;
    let elementId: string;

    if (!resultElement) {
      resultElement = await findAIElementByNameInAppwrite(generated.name);
    }

    if (resultElement) {
      // On réutilise l'élément existant (base ou IA)
      elementId = resultElement.id;
      isNewElement = false;
    } else {
      // Création d'un nouvel élément IA
      elementId = key;
      resultElement = {
        id: elementId,
        name: generated.name,
        emoji: generated.emoji,
        type: generated.type as any,
        properties: ['ai-generated'],
        isAIGenerated: true,
        createdBy: userId,
        createdAt: Date.now(),
        discovererName: userName,
      } as AIElement;
      isNewElement = true;
    }

    const aiCombo: AICombination = {
      id: key,
      elementA: a,
      elementB: b,
      resultId: elementId,
      discoveredBy: userId,
      discoveredAt: Date.now(),
      discovererName: userName,
      resultName: resultElement.name,
      resultEmoji: resultElement.emoji,
    };

    // 6. Sauvegarde dans Appwrite
    if (databases) {
      // Sauvegarder l'élément seulement s'il est nouveau et IA
      if (isNewElement && resultElement.isAIGenerated) {
        try {
          await databases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.aiElements,
            elementId,
            {
              id: elementId,
              name: resultElement.name,
              emoji: resultElement.emoji,
              type: resultElement.type,
              properties: resultElement.properties,
              createdBy: userId,
              createdAt: new Date().toISOString(),
              isAIGenerated: true,
              discovererName: userName,
            },
            [Permission.read(Role.any()), Permission.update(Role.user(userId))]
          );
        } catch (e: any) {
          if (e.code === 409 || e?.response?.code === 409) {
            const existingEl = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.aiElements,
              elementId
            ).catch(() => null);
            if (existingEl) {
              resultElement = {
                id: existingEl.$id,
                name: existingEl.name,
                emoji: existingEl.emoji,
                type: existingEl.type as any,
                properties: existingEl.properties || [],
                isAIGenerated: true,
                createdBy: existingEl.createdBy,
                createdAt: new Date(existingEl.createdAt).getTime(),
                discovererName: existingEl.discovererName || userName,
              } as AIElement;
              elementId = existingEl.$id;
            }
          } else {
            console.error('Failed to save AI element:', e);
          }
        }
      }

      // Sauvegarder la combinaison
      try {
        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.aiCombinations,
          key,
          {
            id: key,
            comboKey: key,
            elementA: a,
            elementB: b,
            resultId: elementId,
            resultName: resultElement.name,
            resultEmoji: resultElement.emoji,
            discoveredBy: userId,
            discoveredAt: new Date().toISOString(),
            discovererName: userName,
          },
          [Permission.read(Role.any()), Permission.update(Role.user(userId))]
        );
      } catch (e: any) {
        if (e.code === 409 || e?.response?.code === 409) {
          const existingCombo = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.aiCombinations,
            key
          ).catch(() => null);
          if (existingCombo) {
            aiCombo.resultId = existingCombo.resultId;
            aiCombo.resultName = existingCombo.resultName;
            aiCombo.resultEmoji = existingCombo.resultEmoji;
            aiCombo.discovererName = existingCombo.discovererName || userName;

            const existingEl = await databases.getDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.aiElements,
              existingCombo.resultId
            ).catch(() => null);

            if (existingEl) {
              resultElement = {
                id: existingEl.$id,
                name: existingEl.name,
                emoji: existingEl.emoji,
                type: existingEl.type as any,
                properties: existingEl.properties || [],
                isAIGenerated: true,
                createdBy: existingEl.createdBy,
                createdAt: new Date(existingEl.createdAt).getTime(),
                discovererName: existingEl.discovererName || userName,
              } as AIElement;
              elementId = existingEl.$id;
            }
          }
        } else {
          console.error('Failed to save AI combination:', e);
        }
      }
    }

    // 7. Mise en cache local
    localAICache.set(key, aiCombo);
    if (resultElement.isAIGenerated) {
      localElementCache.set(elementId, resultElement as AIElement);
    }
    ELEMENTS[elementId] = resultElement;

    const result = { element: resultElement, isNew: isNewElement };
    resolvePending(key, result);
    return result;
  } catch (e) {
    console.error('AI generation failed:', e);
    resolvePending(key, null);
    return null;
  }
}