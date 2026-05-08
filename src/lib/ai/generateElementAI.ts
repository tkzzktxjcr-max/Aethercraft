/**
 * AI element generation using WebLLM.
 * Handles prompt building, LLM inference, JSON parsing, and timeout.
 */
import * as webllm from "@mlc-ai/web-llm";
import { getElementById } from "./gameData";

let engine: webllm.MLCEngine | null = null;
let initPromise: Promise<webllm.MLCEngine> | null = null;
export type InitProgressCallback = (report: webllm.InitProgressReport) => void;

export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/** Lazily initialize the WebLLM engine (singleton). */
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

export function getEngine(): webllm.MLCEngine | null {
  return engine;
}

const AI_TIMEOUT_MS = 10_000;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function generateElement(
  elementA: { name: string; emoji: string; tags?: string[]; properties?: string[] },
  elementB: { name: string; emoji: string; tags?: string[]; properties?: string[] },
  onProgress?: InitProgressCallback
): Promise<{ name: string; emoji: string; type: string } | null> {
  const llm = await ensureWebLLMEngine(onProgress);

  const tagsA = elementA.tags?.join(", ") || elementA.properties?.join(", ") || "";
  const tagsB = elementB.tags?.join(", ") || elementB.properties?.join(", ") || "";

  const prompt = buildPrompt(elementA, elementB, tagsA, tagsB);

  const messages: webllm.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a creative alchemy game engine. Always produce a real-world result. Be imaginative but grounded in reality. Never invent fictional or magical elements.",
    },
    { role: "user", content: prompt },
  ];

  return Promise.race([
    (async () => {
      const reply = await llm.chat.completions.create({
        messages,
        temperature: 0.6,
        max_tokens: 64,
      });
      return parseAIResponse(reply.choices[0].message.content || "");
    })(),
    sleep(AI_TIMEOUT_MS).then(() => {
      throw new Error("AITimeout");
    }),
  ]);
}

function buildPrompt(
  elementA: { name: string; emoji: string },
  elementB: { name: string; emoji: string },
  tagsA: string,
  tagsB: string
): string {
  return `You are a creative alchemy game engine. Given two elements, invent a new element that results from combining them.

Element A: ${elementA.name} ${elementA.emoji} (properties: ${tagsA})
Element B: ${elementB.name} ${elementB.emoji} (properties: ${tagsB})

RULES:
- The result MUST be a real, existing thing from the real world. No fictional, magical, or invented concepts.
- Use common English words for real objects, substances, materials, natural phenomena, or living things.
- The result should relate to BOTH input elements in some way (physical, chemical, semantic, or metaphorical).
- Output ONLY valid JSON: {"name":"Element Name","emoji":"single_emoji","type":"one_of_energy_liquid_life_cosmic_matter_gas"}
- The name should be a real-world term (1-2 words max)
- Use a single emoji that represents the real element
- Type must be exactly one of: energy, liquid, life, cosmic, matter, gas
- If the result already exists as a common element, USE THAT EXACT NAME
- Do NOT create synonyms for existing elements
- Normalize names to common English words
- AVOID made-up words, fantasy terms, or impossible concepts

Examples of real-world combinations:
Fire + Water = {"name":"Steam","emoji":"♨️","type":"gas"}
Earth + Water = {"name":"Mud","emoji":"💩","type":"liquid"}
Sun + Plant = {"name":"Flower","emoji":"🌸","type":"life"}
Metal + Energy = {"name":"Electricity","emoji":"💡","type":"energy"}
Flower + Plant = {"name":"Garden","emoji":"🌷","type":"life"}
Star + Star = {"name":"Galaxy","emoji":"🌌","type":"cosmic"}
Wood + Fire = {"name":"Campfire","emoji":"🔥","type":"energy"}
Cloud + Air = {"name":"Sky","emoji":"🌌","type":"gas"}
Sand + Fire = {"name":"Glass","emoji":"🥃","type":"matter"}
Stone + Air = {"name":"Sand","emoji":"🏜️","type":"matter"}

Now respond with ONLY the JSON object (no markdown, no extra text):
${elementA.name} + ${elementB.name} = `;
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
