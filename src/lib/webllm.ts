import * as webllm from "@mlc-ai/web-llm";
import { getElementById } from "./gameData";

let engine: webllm.MLCEngine | null = null;

export type InitProgressCallback = (report: webllm.InitProgressReport) => void;

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

export async function initWebLLM(onProgress?: InitProgressCallback): Promise<webllm.MLCEngine> {
  if (!isWebGPUSupported()) {
    throw new Error("WebGPU is not supported in this browser. Try Chrome 113+ or Edge.");
  }

  if (engine) return engine;

  engine = await webllm.CreateMLCEngine(
    "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    {
      initProgressCallback: onProgress,
    }
  );

  return engine;
}

export function getEngine(): webllm.MLCEngine | null {
  return engine;
}

export async function generateElement(
  elementA: { name: string; emoji: string; tags?: string[]; properties?: string[] },
  elementB: { name: string; emoji: string; tags?: string[]; properties?: string[] },
  engineInstance?: webllm.MLCEngine
): Promise<{ name: string; emoji: string; type: string } | null> {
  const llm = engineInstance || engine;
  if (!llm) throw new Error("WebLLM engine not initialized");

  const tagsA = elementA.tags?.join(', ') || elementA.properties?.join(', ') || '';
  const tagsB = elementB.tags?.join(', ') || elementB.properties?.join(', ') || '';

  const prompt = `You are an alchemy game engine. Given two elements, determine if they can logically combine into something new.

Element A: ${elementA.name} ${elementA.emoji} (properties: ${tagsA})
Element B: ${elementB.name} ${elementB.emoji} (properties: ${tagsB})

CRITICAL RULES:
- If the combination makes NO logical sense (e.g., Sky + House, Rainbow + Car, Ocean + Clock), output: null
- Only create an element if there is a clear physical, chemical, or semantic relationship
- Output ONLY valid JSON in one of these two formats:
  - {"name":"Element Name","emoji":"single_emoji","type":"one_of_energy_liquid_life_cosmic_matter_gas"}
  - null
- The name should be creative but logical (1-2 words)
- Use a single emoji that represents the element
- Type must be exactly one of: energy, liquid, life, cosmic, matter, gas
- If the result already exists as a common element (steam, stone, plant, etc.), USE THAT EXACT NAME
- Do NOT create synonyms for existing elements
- Normalize names to common English words

Examples of VALID combinations:
Fire + Water = {"name":"Steam","emoji":"♨️","type":"gas"}
Earth + Water = {"name":"Mud","emoji":"💩","type":"liquid"}
Sun + Plant = {"name":"Flower","emoji":"🌸","type":"life"}
Metal + Energy = {"name":"Electricity","emoji":"💡","type":"energy"}

Examples of INVALID combinations (output null):
Sky + House = null
Rainbow + Car = null
Ocean + Clock = null
Star + Paper = null

Now respond with ONLY the JSON object or null (no markdown, no extra text):
${elementA.name} + ${elementB.name} = `;

  const messages: webllm.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a strict alchemy game engine. Only combine elements that have a logical relationship. Output ONLY valid JSON or null." },
    { role: "user", content: prompt }
  ];

  const reply = await llm.chat.completions.create({
    messages,
    temperature: 0.3,
    max_tokens: 64,
  });

  const raw = reply.choices[0].message.content || "";
  return parseAIResponse(raw);
}

function parseAIResponse(raw: string): { name: string; emoji: string; type: string } | null {
  // Check for null response
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === 'null' || trimmed === 'none' || trimmed === 'undefined') {
    return null;
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.name && parsed.emoji && parsed.type) {
        const validTypes = ['energy', 'liquid', 'life', 'cosmic', 'matter', 'gas'];
        const type = validTypes.includes(parsed.type) ? parsed.type : 'matter';
        const name = String(parsed.name)
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .slice(0, 30);
        const emoji = String(parsed.emoji).trim().slice(0, 2);
        return { name, emoji, type };
      }
    }
  } catch {
    // fallback below
  }

  // If we can't parse and it's not explicitly null, default to null (safer than random element)
  return null;
}