/**
 * Post-generation semantic validation for AI-combined elements.
 * Rejects incoherent or tautological results.
 * Fantasy/mythical elements are ALLOWED as long as they are culturally known concepts
 * (e.g., Dragon, Phoenix, Unicorn — not "Voidling" or "Starfire").
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

  // 2. Semantic link: result must share at least one trait with A or B
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

  // 3. Anti-invented: reject clearly made-up portmanteau words
  const inventedPatterns = [
    /\w+ling/,     // voidling, starling, etc.
    /\w+fire/,    // starfire, moonfire
    /\w+beam/,    // moonbeam, sunbeam
    /\w+soul/,    // voidsoul
    /\w+storm/,   // voidstorm
  ];
  if (inventedPatterns.some((re) => re.test(resultName))) {
    return { valid: false, reason: "Portmanteau / invented word" };
  }

  // 4. Length check
  if (result.name.length < 2 || result.name.length > 30) {
    return { valid: false, reason: "Name too short or too long" };
  }

  return { valid: true };
}

/** Fallback element when AI fails to generate anything logical.
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
