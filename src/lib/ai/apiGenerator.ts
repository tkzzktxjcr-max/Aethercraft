/**
 * Server-side AI generation via Ollama API with streaming progress.
 * No fallback — Ollama is the sole AI source.
 * Streaming shows partial output in real-time for immersive UX.
 */
import type { GameElement } from "@/types/game";

const OLLAMA_URL = "https://ai.aethercraft.071098v2.duckdns.org/api/generate";
const OLLAMA_MODEL = "qwen2.5:7b";

export type OnProgress = (partialText: string) => void;

/**
 * Stream a combination from Ollama, showing partial text as it arrives.
 */
export async function generateElementStream(
  elementA: GameElement,
  elementB: GameElement,
  onProgress: OnProgress,
  validator?: (result: { name: string; emoji: string; type: string }) => {
    valid: boolean;
    reason?: string;
  }
): Promise<{ name: string; emoji: string; type: string } | null> {
  const prompt = buildPrompt(elementA, elementB);

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: true,
      options: {
        temperature: 0.7,
        num_predict: 80,
      },
    }),
  });

  if (!res.ok) {
    console.error("[AI] Server error:", res.status);
    return null;
  }

  const reader = res.body?.getReader();
  if (!reader) return null;

  const decoder = new TextDecoder();
  let buffer = "";
  let fullResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const msg = JSON.parse(line);
        if (msg.response) {
          fullResponse += msg.response;
          onProgress(fullResponse);
        }
        if (msg.done) break;
      } catch {
        // ignore malformed line
      }
    }
  }

  const generated = parseServerResponse(fullResponse);
  if (!generated) return null;

  if (validator) {
    const check = validator(generated);
    if (!check.valid) {
      console.warn("[AI] Server result rejected:", check.reason);
      return null;
    }
  }

  return generated;
}

function buildPrompt(elementA: GameElement, elementB: GameElement): string {
  const propsA = [...elementA.properties, ...(elementA.tags || []), elementA.type].filter(Boolean);
  const propsB = [...elementB.properties, ...(elementB.tags || []), elementB.type].filter(Boolean);

  return `You are an infinite-crafting alchemy game engine inspired by Infinite Craft.

Combine these two elements into ONE new element. The result must be creative, surprising, and instantly make sense.

RULES:
- The result MUST follow at least one logic: physical, symbolic, cultural, humorous, linguistic, scientific, emotional, historical, or fictional
- The result must feel obvious AFTER the fact ("ah yes... that makes sense")
- Name: 1-4 common English words max
- Never make up invented words (no Starfire, Voidling)
- Output ONLY valid JSON: {"name":"...","emoji":"...","type":"..."}
- Type must be one of: energy, liquid, life, cosmic, matter, gas

Element A: ${elementA.name} ${elementA.emoji} (${propsA.join(", ")})
Element B: ${elementB.name} ${elementB.emoji} (${propsB.join(", ")})

GOOD:
Fire + Water → {"name":"Steam","emoji":"♨️","type":"gas"}
Robot + Magic → {"name":"Technomancy","emoji":"🤖","type":"energy"}
Cat + Internet → {"name":"Meme","emoji":"😹","type":"matter"}
Moon + Love → {"name":"Tide","emoji":"🌊","type":"liquid"}
Dragon + Fire → {"name":"Ash Drake","emoji":"🐉","type":"life"}

BAD:
Fire + Water → {"name":"Cosmic Banana","emoji":"🍌","type":"matter"}
Metal + Fire → {"name":"Quantum Explosion","emoji":"💥","type":"energy"}

${elementA.name} + ${elementB.name} → `;
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
