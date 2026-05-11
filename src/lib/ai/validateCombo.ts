/**
 * Light post-generation validation.
 * Only blocks: tautology (A+B=A) and invented portmanteau words.
 * Fantasy, mythical, and surprising results are encouraged.
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

  // 1. Tautology check: result must differ from both inputs
  if (resultName === elementA.name.toLowerCase().trim()) {
    return { valid: false, reason: "Result equals input A" };
  }
  if (resultName === elementB.name.toLowerCase().trim()) {
    return { valid: false, reason: "Result equals input B" };
  }

  // 2. Anti-invented: reject clearly made-up portmanteau words
  const inventedPatterns = [
    /\w+ling$/,    // voidling, starling, etc.
    /\w+fire$/,    // starfire, moonfire
    /\w+beam$/,   // moonbeam, sunbeam
    /\w+soul$/,   // voidsoul
    /\w+storm$/,  // voidstorm
    /^[a-z]+\d+$/, // anything with numbers
  ];
  if (inventedPatterns.some((re) => re.test(resultName))) {
    return { valid: false, reason: "Made-up portmanteau" };
  }

  // 3. Length check
  if (result.name.length < 2 || result.name.length > 40) {
    return { valid: false, reason: "Name too short or too long" };
  }

  return { valid: true };
}

/** Fallback element when AI fails to generate anything.
 *  Returns a generic "nothing happened" so the orbs stay on canvas. */
export function getFallbackResult(
  elementA: GameElement,
  elementB: GameElement
): { name: string; emoji: string; type: string } {
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
