/**
 * Post-generation semantic validation for AI-combined elements.
 * Rejects incoherent or tautological results before they reach the game.
 */
import type { GameElement } from "@/types/game";
import { ELEMENTS } from "../gameData";
import { getAllCachedElements } from "../cache";

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
  return null;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateCombo(
  elementA: GameElement,
  elementB: GameElement,
  result: { name: string; emoji: string; type: string }
): ValidationResult {
  const resultName = result.name.toLowerCase().trim();
  const nameA = elementA.name.toLowerCase().trim();
  const nameB = elementB.name.toLowerCase().trim();

  // 1. Tautology check: result must differ from both inputs
  if (resultName === nameA || slugify(result.name) === slugify(elementA.name)) {
    return { valid: false, reason: "Result equals input A (tautology)" };
  }
  if (resultName === nameB || slugify(result.name) === slugify(elementB.name)) {
    return { valid: false, reason: "Result equals input B (tautology)" };
  }

  // 2. Semantic link: result must share at least one tag/property/type with A or B
  const aTraits = new Set([
    elementA.type,
    ...elementA.properties.map((p) => p.toLowerCase()),
    ...(elementA.tags || []).map((t) => t.toLowerCase()),
  ]);
  const bTraits = new Set([
    elementB.type,
    ...elementB.properties.map((p) => p.toLowerCase()),
    ...(elementB.tags || []).map((t) => t.toLowerCase()),
  ]);
  const resultTraits = new Set([
    result.type.toLowerCase(),
    ...resultName.split(/\s+/),
  ]);

  const hasLinkToA = [...resultTraits].some((t) => aTraits.has(t));
  const hasLinkToB = [...resultTraits].some((t) => bTraits.has(t));

  if (!hasLinkToA && !hasLinkToB) {
    return { valid: false, reason: "No semantic link to either input" };
  }

  // 3. Anti-synonym: reject exact duplicates of existing elements
  const existing = findElementByNameLocal(result.name);
  if (existing) {
    // If the result already exists and is NOT one of the inputs, that's actually OK
    // — we want to reuse known elements. Only reject if it's a weird synonym.
    const isWeirdSynonym =
      existing.id !== resultName.replace(/\s+/g, "_") &&
      !aTraits.has(existing.type) &&
      !bTraits.has(existing.type);

    if (isWeirdSynonym) {
      return { valid: false, reason: "Synonym with no logical connection" };
    }
  }

  // 4. Real-world plausibility: reject overly abstract / fantasy words
  const fantasyWords = [
    "magic", "spell", "potion", "enchanted", "mystic", "arcane",
    "divine", "ethereal", "phantom", "spirit", "ghost",
    "dragon", "unicorn", "phoenix", "wizard", "sorcerer",
    "voidling", "starfire", "moonbeam", "soul",
  ];
  if (fantasyWords.some((w) => resultName.includes(w))) {
    return { valid: false, reason: "Fantasy/magical concept rejected" };
  }

  // 5. Length check
  if (result.name.length < 2 || result.name.length > 30) {
    return { valid: false, reason: "Name too short or too long" };
  }

  return { valid: true };
}

/** Fallback element when AI generates garbage. */
export function getFallbackResult(
  elementA: GameElement,
  elementB: GameElement
): { name: string; emoji: string; type: string } {
  // Try to derive a "waste" or "mixture" from the inputs
  const hasChemical =
    [...elementA.properties, ...elementB.properties].some((p) =>
      ["acid", "base", "reactive", "corrosive", "toxic", "chemical"].includes(p.toLowerCase())
    );
  if (hasChemical) {
    return { name: "Compound", emoji: "🧪", type: "matter" };
  }

  const hasLife = elementA.type === "life" || elementB.type === "life";
  if (hasLife) {
    return { name: "Mutation", emoji: "🧬", type: "life" };
  }

  const hasEnergy = elementA.type === "energy" || elementB.type === "energy";
  if (hasEnergy) {
    return { name: "Spark", emoji: "✨", type: "energy" };
  }

  return { name: "Mixture", emoji: "🌫️", type: "matter" };
}
