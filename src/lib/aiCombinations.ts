import { generateElement, initWebLLM } from './webllm';
import { getElementById, ELEMENTS } from './gameData';
import { getAppwriteClient, APPWRITE_CONFIG } from './appwrite';
import type { AIElement, AICombination, GameElement } from '@/types/game';
import { Permission, Role, Query } from 'appwrite';
import {
  getCachedCombination,
  getCachedElement,
  setCachedCombination,
  setCachedElement,
  getAllCachedElements,
  loadAllFromDB,
} from './cache';
import { findTagBasedCombination } from './tagEngine';

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
    setCachedElement(el);
  });
  Object.values(aiCombinations).forEach((combo) => {
    setCachedCombination(combo);
  });
  loadAllFromDB().then(() => {
    const elements = getAllCachedElements();
    Object.values(elements).forEach((el) => {
      ELEMENTS[el.id] = el;
    });
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

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function findElementByNameLocal(name: string): GameElement | null {
  const normalized = name.toLowerCase().trim();
  const slug = slugify(name);
  
  const allElements = { ...ELEMENTS, ...getAllCachedElements() };
  for (const el of Object.values(allElements)) {
    if (el.name.toLowerCase().trim() === normalized) return el;
  }
  
  for (const el of Object.values(allElements)) {
    if (slugify(el.name) === slug) return el;
  }
  
  for (const el of Object.values(allElements)) {
    const elSlug = slugify(el.name);
    if (elSlug.includes(slug) || slug.includes(elSlug)) return el;
  }
  
  return null;
}

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
      setCachedElement(element);
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

  const localCombo = getCachedCombination(key);
  if (localCombo) {
    const el = getCachedElement(localCombo.resultId) || ELEMENTS[localCombo.resultId];
    if (el) return { element: el, isNew: false };
  }

  if (pendingGenerations.has(key)) {
    return waitForPending(key);
  }

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
      setCachedCombination(combo);

      const el = getCachedElement(combo.resultId) || ELEMENTS[combo.resultId];
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
        setCachedElement(element);
        ELEMENTS[element.id] = element;
        return { element, isNew: false };
      }
    } catch (e: any) {
      if (e.code !== 404 && e?.response?.code !== 404) {
        console.error('Appwrite lookup error:', e);
      }
    }
  }

  // STEP 1: Try tag-based engine for logical results
  const tagResult = findTagBasedCombination(a, b);
  if (tagResult) {
    let resultElement = findElementByNameLocal(tagResult.name);
    let isNewElement = false;
    let elementId: string;

    if (resultElement) {
      elementId = resultElement.id;
      isNewElement = false;
    } else {
      elementId = key;
      resultElement = {
        id: elementId,
        name: tagResult.name,
        emoji: tagResult.emoji,
        type: tagResult.type as any,
        properties: ['tag-generated'],
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

    if (databases && isNewElement) {
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
          [Permission.read(Role.any()), Permission.write(Role.any())]
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
            isNewElement = false;
          }
        }
      }
    }

    try {
      await databases?.createDocument(
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
        [Permission.read(Role.any()), Permission.write(Role.any())]
      );
    } catch (e: any) {
      if (e.code !== 409 && e?.response?.code !== 409) {
        console.error('Failed to save tag combination:', e);
      }
    }

    setCachedCombination(aiCombo);
    if (resultElement.isAIGenerated) {
      setCachedElement(resultElement as AIElement);
    }
    ELEMENTS[elementId] = resultElement;

    return { element: resultElement, isNew: isNewElement };
  }

  // STEP 2: Fallback to AI for exotic combinations
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

    if (!generated) {
      resolvePending(key, null);
      return null;
    }

    let resultElement: GameElement | null = findElementByNameLocal(generated.name);
    let isNewElement = false;
    let elementId: string;

    if (!resultElement) {
      resultElement = await findAIElementByNameInAppwrite(generated.name);
    }

    if (resultElement) {
      elementId = resultElement.id;
      isNewElement = false;
      console.log(`[AI] Reusing existing element: ${resultElement.name} (${elementId})`);
    } else {
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
      console.log(`[AI] Creating new element: ${generated.name} (${elementId})`);
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

    if (databases) {
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
            [Permission.read(Role.any()), Permission.write(Role.any())]
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
          [Permission.read(Role.any()), Permission.write(Role.any())]
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

    setCachedCombination(aiCombo);
    if (resultElement.isAIGenerated) {
      setCachedElement(resultElement as AIElement);
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