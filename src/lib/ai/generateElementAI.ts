/**
 * AI element generation using WebLLM.
 * Simple prompt + light validation. Creativity is encouraged.
 */
import * as webllm from "@mlc-ai/web-llm";

let engine: webllm.MLCEngine | null = null;
let initPromise: Promise<webllm.MLCEngine> | null = null;
export type InitProgressCallback = (report: webllm.InitProgressReport) => void;

export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

const AI_TIMEOUT_MS = 10_000;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** Lazily initialize the WebLLM engine (singleton). No timeout here —
 *  model download can take several minutes on first load. */
export async function ensureWebLLMEngine(
  onProgress?: InitProgressCallback
): Promise<webllm.MLCEngine> {
  if (!isWebGPUSupported()) {
    throw new Error("WebGPU is not supported in this browser. Try Chrome 113+ or Edge.");
  }
  if (engine) return engine;
  if (initPromise) return initPromise;

  initPromise = webllm.CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
    initProgressCallback: onProgress,
  }).then((eng) => {
    engine = eng;
    return eng;
  });

  return initPromise;
}

const MAX_RETRIES = 2;

export async function generateElement(
  elementA: { name: string; emoji: string; tags?: string[]; properties?: string[]; type?: string },
  elementB: { name: string; emoji: string; tags?: string[]; properties?: string[]; type?: string },
  onProgress?: InitProgressCallback,
  validator?: (
    result: { name: string; emoji: string; type: string }
  ) => { valid: boolean; reason?: string }
): Promise<{ name: string; emoji: string; type: string } | null> {
  const llm = await ensureWebLLMEngine(onProgress);

  const propsA = [...elementA.properties, ...(elementA.tags || []), elementA.type || ""].filter(Boolean);
  const propsB = [...elementB.properties, ...(elementB.tags || []), elementB.type || ""].filter(Boolean);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const prompt = buildPrompt(
      elementA,
      elementB,
      propsA.join(", "),
      propsB.join(", "),
      attempt
    );

    const messages: webllm.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are an alchemy game engine. Combine two elements into a single new element. Be creative and surprising, but grounded in real-world physics, chemistry, biology, mythology, or culture. Output ONLY valid JSON.",
      },
      { role: "user", content: prompt },
    ];

    try {
      const reply = await Promise.race([
        llm.chat.completions.create({
          messages,
          temperature: attempt === 0 ? 0.7 : 0.85, // creative but structured
          max_tokens: 80,
        }),
        sleep(AI_TIMEOUT_MS).then(() => {
          throw new Error("AITimeout");
        }),
      ]);

      const generated = parseAIResponse(reply.choices[0].message.content || "");
      if (!generated) continue;

      if (validator) {
        const check = validator(generated);
        if (!check.valid) {
          console.warn(`[AI] Attempt ${attempt + 1} rejected: ${check.reason}`);
          continue;
        }
      }

      return generated;
    } catch {
      // retry on next loop
    }
  }

  return null;
}

const ANGLES = [
  "What forms when these two things meet in the real world, in nature, or in a lab?",
  "What mythical or cultural concept naturally emerges from combining these two elements?",
  "What physical object, substance, or phenomenon results from these two interacting?",
  "If an alchemist combined these two, what would the reaction produce?",
];

function buildPrompt(
  elementA: { name: string; emoji: string },
  elementB: { name: string; emoji: string },
  propsA: string,
  propsB: string,
  attempt: number
): string {
  const angle = ANGLES[attempt % ANGLES.length];

  return `${angle}

Element A: ${elementA.name} ${elementA.emoji} (${propsA})
Element B: ${elementB.name} ${elementB.emoji} (${propsB})

RULES:
- The result must be a SINGLE concept: a real object, substance, natural phenomenon, creature, plant, material, or well-known mythical entity.
- The name must be 1-3 common English words. No made-up words like "Starfire" or "Voidling".
- Use a single emoji that represents the result.
- Output ONLY valid JSON: {"name":"...","emoji":"...","type":"..."}
- Type must be one of: energy, liquid, life, cosmic, matter, gas.
- If the combination makes no sense, invent something poetic but grounded (e.g., Moon + Love → Tide).

Examples:
Fire + Water → {"name":"Steam","emoji":"♨️","type":"gas"}
Earth + Water → {"name":"Mud","emoji":"💩","type":"liquid"}
Metal + Fire → {"name":"Molten Metal","emoji":"🔥","type":"matter"}
Dragon + Fire → {"name":"Ash Drake","emoji":"🐉","type":"life"}
Light + Glass → {"name":"Prism","emoji":"🔮","type":"matter"}
Moon + Love → {"name":"Tide","emoji":"🌊","type":"liquid"}

Now: ${elementA.name} + ${elementB.name} → `;
}

function parseAIResponse(raw: string): { name: string; emoji: string; type: string } | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.name && parsed.emoji && parsed.type) {
        const validTypes = ["energy", "liquid", "life", "cosmic", "matter", "gas"];
        const type = validTypes.includes(parsed.type) ? parsed.type : "matter";
        const name = String(parsed.name)
          .trim()
          .replace(/\s+/g, " ")
          .replace(/[^\w\s]/g, "")
          .slice(0, 40);
        const emoji = String(parsed.emoji).trim().slice(0, 2);
        return { name, emoji, type };
      }
    }
  } catch {
    // malformed JSON — fallback
  }
  return null;
}
