/**
 * AI element generation using WebLLM with structured prompts and post-validation.
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
    const prompt = buildPrompt(elementA, elementB, propsA.join(", "), propsB.join(", "), attempt);

    const messages: webllm.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a physical/chemical simulation engine for an alchemy game. Always produce real-world results grounded in physics, chemistry, or biology. Never invent magical or fictional concepts.",
      },
      { role: "user", content: prompt },
    ];

    try {
      const reply = await Promise.race([
        llm.chat.completions.create({
          messages,
          temperature: attempt === 0 ? 0.4 : 0.2, // stricter on retries
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

function buildPrompt(
  elementA: { name: string; emoji: string },
  elementB: { name: string; emoji: string },
  propsA: string,
  propsB: string,
  attempt: number
): string {
  const retryHint = attempt > 0 ? "\n⚠️ Previous result was rejected as illogical. Think more carefully." : "";

  return `You are a physical/chemical simulation engine for an alchemy game.
Given two elements, determine the MOST LOGICAL real-world result of their interaction.

Element A: ${elementA.name} ${elementA.emoji}
  Traits: ${propsA}

Element B: ${elementB.name} ${elementB.emoji}
  Traits: ${propsB}

RULES (in strict priority order):
1. CHEMICAL REACTION: If the elements react chemically (acid+metal, fire+water, electricity+water), output the chemical product.
2. PHYSICAL COMPOSITION: If one element is made OF the other (tree+tool=wood), output the component/substance.
3. PHYSICAL COMBINATION: If the elements combine into a larger object (wheel+cart=vehicle), output the composite.
4. NATURAL INTERACTION: If the elements interact in nature (sun+plant=growth, rain+earth=plant), output the natural result.
5. ENERGY TRANSFORMATION: If energy acts on matter (fire+metal=melting, light+prism=rainbow), output the transformed state.
6. The result MUST be a real, existing thing. No magic, fantasy, or invented concepts.
7. The result MUST be MORE COMPLEX or DIFFERENT from both inputs. "A+B=A" is INVALID.
8. The result MUST relate to BOTH inputs through physics, chemistry, or biology.
9. Output ONLY valid JSON: {"name":"Element Name","emoji":"single_emoji","type":"one_of_energy_liquid_life_cosmic_matter_gas"}
10. Type must be exactly one of: energy, liquid, life, cosmic, matter, gas.

Examples of LOGICAL real-world combinations:
Fire + Water → {"name":"Steam","emoji":"♨️","type":"gas"}
Earth + Water → {"name":"Mud","emoji":"💩","type":"liquid"}
Metal + Fire → {"name":"Molten Metal","emoji":"🔥","type":"matter"}
Electricity + Water → {"name":"Electrolysis","emoji":"⚡","type":"energy"}
Sun + Plant → {"name":"Flower","emoji":"🌸","type":"life"}
Glass + Light → {"name":"Prism","emoji":"🔮","type":"matter"}
Acid + Metal → {"name":"Hydrogen","emoji":"💨","type":"gas"}
Wheel + Wood → {"name":"Cart","emoji":"🛒","type":"matter"}
${retryHint}
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
          .slice(0, 30);
        const emoji = String(parsed.emoji).trim().slice(0, 2);
        return { name, emoji, type };
      }
    }
  } catch {
    // malformed JSON — fallback
  }
  return null;
}
