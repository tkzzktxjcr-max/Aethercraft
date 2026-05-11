/**
 * Server-side AI generation via Ollama API.
 * Falls back to WebLLM local if server is unreachable.
 */
import { generateElement as generateLocal } from "./generateElementAI";
import type { GameElement } from "@/types/game";

const OLLAMA_URL =
  import.meta.env.VITE_OLLAMA_URL || "https://ai.aethercraft.071098v2.duckdns.org/api/generate";

const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "llama3.1:8b";

const API_TIMEOUT_MS = 20_000;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/**
 * Try server-side Ollama first, fallback to local WebLLM if offline.
 */
export async function generateElement(
  elementA: GameElement,
  elementB: GameElement,
  validator?: (result: { name: string; emoji: string; type: string }) => {
    valid: boolean;
    reason?: string;
  }
): Promise<{ name: string; emoji: string; type: string } | null> {
  // Try server first
  try {
    const serverResult = await generateViaServer(elementA, elementB, validator);
    if (serverResult) return serverResult;
  } catch {
    console.warn("[AI] Server unreachable — falling back to local WebLLM");
  }

  // Fallback to local WebLLM
  return generateLocal(elementA, elementB, undefined, validator);
}

async function generateViaServer(
  elementA: GameElement,
  elementB: GameElement,
  validator?: (result: { name: string; emoji: string; type: string }) => {
    valid: boolean;
    reason?: string;
  }
): Promise<{ name: string; emoji: string; type: string } | null> {
  const propsA = [...elementA.properties, ...(elementA.tags || []), elementA.type].filter(Boolean);
  const propsB = [...elementB.properties, ...(elementB.tags || []), elementB.type].filter(Boolean);

  const prompt = buildServerPrompt(elementA, elementB, propsA.join(", "), propsB.join(", "));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 80,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error("[AI] Server error:", res.status);
      return null;
    }

    const data = await res.json();
    const raw = data.response || "";
    const generated = parseServerResponse(raw);
    if (!generated) return null;

    if (validator) {
      const check = validator(generated);
      if (!check.valid) {
        console.warn("[AI] Server result rejected:", check.reason);
        return null;
      }
    }

    return generated;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}

function buildServerPrompt(
  elementA: GameElement,
  elementB: GameElement,
  propsA: string,
  propsB: string
): string {
  return `[INST] You are an infinite-crafting alchemy engine inspired by games like Infinite Craft.

Combine these two elements into ONE new element.

RULES:
- The result must feel obvious after the fact ("ah yes… that makes sense")
- Follow causal, cultural, metaphorical, humorous, or scientific logic
- Name: 1-4 common English words max
- NO made-up portmanteaus (no Starfire, Voidling)
- Output ONLY valid JSON: {"name":"...","emoji":"...","type":"..."}
- type must be one of: energy, liquid, life, cosmic, matter, gas

Element A: ${elementA.name} ${elementA.emoji} (${propsA})
Element B: ${elementB.name} ${elementB.emoji} (${propsB})

GOOD: Fire + Water → {"name":"Steam","emoji":"♨️","type":"gas"}
GOOD: Robot + Magic → {"name":"Technomancy","emoji":"🤖","type":"energy"}
GOOD: Cat + Internet → {"name":"Meme","emoji":"😹","type":"matter"}
BAD: Fire + Water → {"name":"Cosmic Banana","emoji":"🍌","type":"matter"}

${elementA.name} + ${elementB.name} → [/INST]`;
}

function parseServerResponse(raw: string): { name: string; emoji: string; type: string } | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.name && parsed.emoji && parsed.type) {
        const validTypes = ["energy", "liquid", "life", "cosmic", "matter", "gas"];
        const type = validTypes.includes(parsed.type) ? parsed.type : "matter";
        return {
          name: String(parsed.name).trim().slice(0, 40),
          emoji: String(parsed.emoji).trim().slice(0, 2),
          type,
        };
      }
    }
  } catch {
    // malformed
  }
  return null;
}
