import type { GameElement } from "@/types/game";
import { buildPrompt } from "./apiPrompts";

const OLLAMA_URL = "https://ai.aethercraft.071098v2.duckdns.org/api/generate";
const OLLAMA_MODEL = "qwen2.5:7b";

export type OnProgress = (partialText: string) => void;

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
        temperature: 0.85,
        num_predict: 60,
        top_k: 40,
        top_p: 0.9,
        repeat_penalty: 1.1,
        seed: Math.floor(Math.random() * 100000),
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

function parseServerResponse(raw: string): { name: string; emoji: string; type: string } | null {
  try {
    const cleaned = raw.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    const jsonMatch = cleaned.match(/\{[^{}]*\}/);
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
