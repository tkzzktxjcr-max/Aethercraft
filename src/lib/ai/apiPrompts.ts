import type { GameElement } from "@/types/game";
import { ELEMENTS } from "./gameData";

const POETIC_INTROS = [
  "From ancient cosmic whispers,",
  "As stars align across the void,",
  "In the crucible of chaos and wonder,",
  "Through the alchemy of dreams,",
  "Where forgotten myths collide,",
];

export function getUsedElementNames(): string[] {
  return Object.values(ELEMENTS).map(e => e.name.toLowerCase());
}

export function buildPrompt(elementA: GameElement, elementB: GameElement): string {
  const propsA = [...elementA.properties, ...(elementA.tags || []), elementA.type].filter(Boolean);
  const propsB = [...elementB.properties, ...(elementB.tags || []), elementB.type].filter(Boolean);
  const intro = POETIC_INTROS[Math.floor(Math.random() * POETIC_INTROS.length)];
  const used = getUsedElementNames().join(", ");

  return `${intro} two forces intertwine.

COMBINE: ${elementA.name} ${elementA.emoji} (${propsA.join(", ")}) + ${elementB.name} ${elementB.emoji} (${propsB.join(", ")})

RULES OF THE FORGE:
1. Result must SURPRISE yet feel INEVITABLE after the reveal.
2. NEVER use: ${used} or any generic word like "Fusion", "Mix", "Combo".
3. The name should evoke a STORY, not a category. Abstract + physical = mythic. Physical + cosmic = transcendent.
4. Name: 1-3 uncommon English words, ideally poetic or mythic. No "FireWater" or "CosmicBanana".
5. Emoji: single, vivid, and culturally resonant.
6. Output ONLY valid JSON: {"name":"...","emoji":"...","type":"..."}
7. Type: energy, liquid, life, cosmic, matter, gas.

MASTERPIECES:
Robot 🤖 + Magic ✨ → {"name":"Technomancy","emoji":"🤖","type":"energy"}
Cat 🐱 + Internet 🌐 → {"name":"Nyan Paradox","emoji":"😹","type":"cosmic"}
Moon 🌙 + Love 💕 → {"name":"Tidal Yearning","emoji":"🌊","type":"liquid"}
Dragon 🐉 + Fire 🔥 → {"name":"Ash Drake","emoji":"🐉","type":"life"}
Glass 💎 + Time ⏳ → {"name":"Hourglass Prism","emoji":"⏳","type":"matter"}

CLICHÉS TO AVOID:
Fire 🔥 + Water 💧 → {"name":"Steam","emoji":"♨️","type":"gas"} (too generic, pick something mythic instead)

NOW, THE FORGE AWAITS.
${elementA.name} ${elementA.emoji} + ${elementB.name} ${elementB.emoji} → `;
}
