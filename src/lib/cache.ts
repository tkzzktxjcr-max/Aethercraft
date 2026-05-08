import type { AIElement, AICombination } from '@/types/game';

const memoryElements = new Map<string, AIElement>();
const memoryCombinations = new Map<string, AICombination>();
let dbInitialized = false;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('aethercraft_v2', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('aiElements')) {
        db.createObjectStore('aiElements', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('aiCombinations')) {
        db.createObjectStore('aiCombinations', { keyPath: 'id' });
      }
    };
  });
}

async function saveToDB(storeName: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await new Promise<void>((resolve, reject) => {
      const req = store.put(data);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Cache save error:', e);
  }
}

export async function loadAllFromDB(): Promise<void> {
  if (dbInitialized) return;
  try {
    const db = await openDB();
    const loadStore = async (name: string) => {
      const tx = db.transaction(name, 'readonly');
      const store = tx.objectStore(name);
      return new Promise<any[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    };

    const elements = await loadStore('aiElements');
    elements.forEach((el) => memoryElements.set(el.id, el));

    const combos = await loadStore('aiCombinations');
    combos.forEach((combo) => memoryCombinations.set(combo.id, combo));

    dbInitialized = true;
  } catch (e) {
    console.error('Cache init error:', e);
  }
}

export function getCachedElement(id: string): AIElement | undefined {
  return memoryElements.get(id);
}

export function getCachedCombination(id: string): AICombination | undefined {
  return memoryCombinations.get(id);
}

export function setCachedElement(element: AIElement): void {
  memoryElements.set(element.id, element);
  saveToDB('aiElements', element);
}

export function setCachedCombination(combo: AICombination): void {
  memoryCombinations.set(combo.id, combo);
  saveToDB('aiCombinations', combo);
}

export function getAllCachedElements(): Record<string, AIElement> {
  return Object.fromEntries(memoryElements);
}

export function getAllCachedCombinations(): Record<string, AICombination> {
  return Object.fromEntries(memoryCombinations);
}