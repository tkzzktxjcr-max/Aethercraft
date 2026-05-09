/**
 * Centralized Appwrite database operations.
 * This is the ONLY file that should import the raw Appwrite client.
 */
import {
  Permission,
  Role,
  type Models,
} from "appwrite";
import { getAppwriteClient } from "../appwrite";
import type { AIElement, AICombination } from "@/types/game";

const { databases } = getAppwriteClient();

const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "aethercraft_db";
const COLLECTIONS = {
  aiElements: import.meta.env.VITE_APPWRITE_AI_ELEMENTS_COLLECTION || "ai_elements",
  aiCombinations: import.meta.env.VITE_APPWRITE_AI_COMBINATIONS_COLLECTION || "ai_combinations",
  userProfiles: import.meta.env.VITE_APPWRITE_USER_PROFILES_COLLECTION || "user_profiles",
} as const;

export const DB_Collections = COLLECTIONS;

function getDatabases() {
  const { databases } = getAppwriteClient();
  if (!databases) throw new Error("Appwrite databases client not available");
  return databases;
}

export async function findElementById(id: string): Promise<AIElement | null> {
  try {
    const db = getDatabases();
    const doc = await db.getDocument(DB_ID, COLLECTIONS.aiElements, id);
    return documentToElement(doc);
  } catch {
    return null;
  }
}

export async function findElementByName(name: string): Promise<AIElement | null> {
  try {
    const db = getDatabases();
    const { Query } = await import("appwrite");
    const res = await db.listDocuments(DB_ID, COLLECTIONS.aiElements, [
      Query.equal("name", name),
    ]);
    if (res.documents.length === 0) return null;
    return documentToElement(res.documents[0]);
  } catch {
    return null;
  }
}

export async function findCombinationById(id: string): Promise<AICombination | null> {
  try {
    const db = getDatabases();
    const doc = await db.getDocument(DB_ID, COLLECTIONS.aiCombinations, id);
    return documentToCombination(doc);
  } catch {
    return null;
  }
}

export async function createElement(
  element: AIElement,
  userId: string
): Promise<AIElement | null> {
  try {
    const db = getDatabases();
    const doc = await db.createDocument(
      DB_ID,
      COLLECTIONS.aiElements,
      element.id,
      {
        id: element.id,
        name: element.name,
        emoji: element.emoji,
        type: element.type,
        properties: element.properties,
        createdBy: userId,
        createdAt: new Date(element.createdAt).toISOString(),
        isAIGenerated: true,
        discovererName: element.discovererName,
      },
      [Permission.read(Role.any()), Permission.write(Role.any())]
    );
    return documentToElement(doc);
  } catch (e: any) {
    if (e.code === 409 || e?.response?.code === 409) {
      return findElementById(element.id);
    }
    console.error("Failed to save AI element:", e);
    return null;
  }
}

export async function createCombination(
  combo: AICombination
): Promise<AICombination | null> {
  try {
    const db = getDatabases();
    const doc = await db.createDocument(
      DB_ID,
      COLLECTIONS.aiCombinations,
      combo.id,
      {
        id: combo.id,
        comboKey: combo.id,
        elementA: combo.elementA,
        elementB: combo.elementB,
        resultId: combo.resultId,
        resultName: combo.resultName,
        resultEmoji: combo.resultEmoji,
        discoveredBy: combo.discoveredBy,
        discoveredAt: new Date(combo.discoveredAt).toISOString(),
        discovererName: combo.discovererName,
      },
      [Permission.read(Role.any()), Permission.write(Role.any())]
    );
    return documentToCombination(doc);
  } catch (e: any) {
    if (e.code === 409 || e?.response?.code === 409) {
      return findCombinationById(combo.id);
    }
    console.error("Failed to save AI combination:", e);
    return null;
  }
}

function documentToElement(doc: Models.Document): AIElement {
  return {
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
}

function documentToCombination(doc: Models.Document): AICombination {
  return {
    id: doc.$id,
    elementA: doc.elementA,
    elementB: doc.elementB,
    resultId: doc.resultId,
    discoveredBy: doc.discoveredBy,
    discoveredAt: new Date(doc.discoveredAt).getTime(),
    discovererName: doc.discovererName,
    resultName: doc.resultName,
    resultEmoji: doc.resultEmoji,
  };
}
