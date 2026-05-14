/**
 * Orchestrates the combination resolution pipeline:
 *   1. predefined combos  →  2. tag-based engine  →  3. local cache  →  4. Appwrite DB  →  5. WebLLM AI
 *
 * Keeps AI combinations state in sync with the ELEMENTS registry.
 */
import {
  findCombination as findPredefinedCombo,
  getElementById,
  ELEMENTS,
} from "./gameData";
import { findTagBasedCombination } from "./tagEngine";
import { generateElementStream } from "./ai/apiGenerator";
import { validateCombo } from "./ai/validateCombo";
import { findElementById, findElementByName, findCombinationById } from "./db/appwrite";
import { getAppwriteClient } from "./appwrite";
import type { AIElement, AICombination, GameElement } from "@/types/game";
import {
  getCachedCombination,
  getCachedElement,
  setCachedCombination,
  setCachedElement,
  getAllCachedElements,
  loadAllFromDB,
} from "./cache";
import { createElement, createCombination } from "./db/appwrite";

const pendingGenerations = new Set<string>();
const pendingResolvers = new Map<
  string,
  Array<(result: { element: GameElement; isNew: boolean } | null) => void>
>();

function hashKey(a: string, b: string): string {
  const sorted = [a, b].sort().join("+");
  let hash = 0x811c9dc5;
  for (let i = 0; i < sorted.length; i++) {
    hash ^= sorted.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const base36 = (hash >>> 0).toString(36);
  return `c${base36.padStart(11, "0").slice(0, 20)}`;
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

function resolvePending(
  key: string,
  result: { element: GameElement; isNew: boolean } | null
) {
  const resolvers = pendingResolvers.get(key) || [];
  resolvers.forEach((r) => r(result));
  pendingResolvers.delete(key);
  pendingGenerations.delete(key);
}

function waitForPending(
  key: string
): Promise<{ element: GameElement; isNew: boolean } | null> {
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
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
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

export async function resolveCombination(
  a: string,
  b: string,
  userId: string,
  userName: string
): Promise<{ element: GameElement; isNew: boolean } | null> {
  const key = getAIComboKey(a, b);

  // Step 1: predefined combos
  const predefined = findPredefinedCombo(a, b);
  if (predefined) {
    const el = getElementById(predefined);
    if (!el) return null;
    return { element: el, isNew: false };
  }

  // Step 2: local cache
  const localCombo = getCachedCombination(key);
  if (localCombo) {
    const el = getCachedElement(localCombo.resultId) || ELEMENTS[localCombo.resultId];
    if (el) return { element: el, isNew: false };
  }

  // Step 3: dedupe concurrent requests
  if (pendingGenerations.has(key)) {
    return waitForPending(key);
  }

  // Step 4: Appwrite DB lookup
  const { databases } = getAppwriteClient();
  if (databases) {
    try {
      const comboDB = await findCombinationById(key);
      if (comboDB) {
        setCachedCombination(comboDB);
        const el = getCachedElement(comboDB.resultId) || ELEMENTS[comboDB.resultId];
        if (el) return { element: el, isNew: false };
        const elDB = await findElementById(comboDB.resultId);
        if (elDB) {
          ELEMENTS[elDB.id] = elDB;
          setCachedElement(elDB);
          return { element: elDB, isNew: false };
        }
      }
    } catch (e: any) {
      if (e.code !== 404 && e?.response?.code !== 404) {
        console.error("Appwrite lookup error:", e);
      }
    }
  }

  // Step 5: tag-based engine (logical results)
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
        properties: ["tag-generated"],
        isAIGenerated: true,
        createdBy: userId,
        createdAt: Date.now(),
        discovererName: userName,
      } satisfies AIElement;
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
      const created = await createElement(resultElement as AIElement, userId);
      if (created) {
        resultElement = created;
        elementId = created.id;
        isNewElement = false;
      }
    }

    await createCombination(aiCombo).catch(() => null);
    setCachedCombination(aiCombo);
    if (resultElement.isAIGenerated) {
      setCachedElement(resultElement as AIElement);
    }
    ELEMENTS[elementId] = resultElement;

    return { element: resultElement, isNew: isNewElement };
  }

  // Step 6: AI fallback (exotic combinations)
  pendingGenerations.add(key);

  try {
    const elA = getElementById(a);
    const elB = getElementById(b);
    if (!elA || !elB) {
      resolvePending(key, null);
      return null;
    }

    // Generate with post-validation (up to MAX_RETRIES inside generateElement)
    const validator = (result: { name: string; emoji: string; type: string }) =>
      validateCombo(elA, elB, result);

    const generated = await generateElementStream(elA, elB, () => {}, validator);
    if (!generated) {
      // AI could not produce a valid result — orbs stay on canvas
      resolvePending(key, null);
      return null;
    }

    let resultElement: GameElement | null = findElementByNameLocal(generated.name);
    if (!resultElement) {
      resultElement = await findElementByName(generated.name);
    }

    let isNewElement = false;
    let elementId: string;

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
        properties: ["ai-generated"],
        isAIGenerated: true,
        createdBy: userId,
        createdAt: Date.now(),
        discovererName: userName,
      } satisfies AIElement;
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
        const created = await createElement(resultElement as AIElement, userId);
        if (created) {
          resultElement = created;
          elementId = created.id;
        }
      }
      const comboDB = await createCombination(aiCombo);
      if (comboDB) {
        aiCombo.resultId = comboDB.resultId;
        aiCombo.resultName = comboDB.resultName;
        aiCombo.resultEmoji = comboDB.resultEmoji;
      }
    }

    setCachedCombination(aiCombo);
    if (resultElement.isAIGenerated) {
      setCachedElement(resultElement as AIElement);
    }
    ELEMENTS[elementId] = resultElement;

    const final = { element: resultElement, isNew: isNewElement };
    resolvePending(key, final);
    return final;
  } catch (e) {
    console.error("AI generation failed:", e);
    resolvePending(key, null);
    return null;
  }
}
