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

  const prompt = `You are a creative alchemy game engine. Given two elements, invent a new element that results from combining them.

Element A: ${elementA.name} ${elementA.emoji} (properties: ${tagsA})
Element B: ${elementB.name} ${elementB.emoji} (properties: ${tagsB})

RULES:
- Be creative! Almost any combination can produce something interesting.
- The result should relate to BOTH input elements in some way (physical, chemical, semantic, or metaphorical).
- Output ONLY valid JSON: {"name":"Element Name","emoji":"single_emoji","type":"one_of_energy_liquid_life_cosmic_matter_gas"}
- The name should be creative but understandable (1-2 words)
- Use a single emoji that represents the element
- Type must be exactly one of: energy, liquid, life, cosmic, matter, gas
- If the result already exists as a common element, USE THAT EXACT NAME
- Do NOT create synonyms for existing elements
- Normalize names to common English words

Examples of creative combinations:
Fire + Water = {"name":"Steam","emoji":"♨️","type":"gas"}
Earth + Water = {"name":"Mud","emoji":"💩","type":"liquid"}
Sun + Plant = {"name":"Flower","emoji":"🌸","type":"life"}
Metal + Energy = {"name":"Electricity","emoji":"💡","type":"energy"}
Flower + Plant = {"name":"Garden","emoji":"🌷","type":"life"}
Star + Star = {"name":"Galaxy","emoji":"🌌","type":"cosmic"}
Wood + Fire = {"name":"Campfire","emoji":"🔥","type":"energy"}
Cloud + Air = {"name":"Sky","emoji":"🌌","type":"gas"}

Now respond with ONLY the JSON object (no markdown, no extra text):
${elementA.name} + ${elementB.name} = `;

  const messages: webllm.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a creative alchemy game engine. Always produce a result. Be imaginative but coherent." },
    { role: "user", content: prompt }
  ];

  const reply = await llm.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 64,
  });

  const raw = reply.choices[0].message.content || "";
  return parseAIResponse(raw);
}

function parseAIResponse(raw: string): { name: string; emoji: string; type: string } | null {
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

  return null;
}