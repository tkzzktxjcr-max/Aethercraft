import * as webllm from "@mlc-ai/web-llm";

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
  elementA: { name: string; emoji: string },
  elementB: { name: string; emoji: string },
  engineInstance?: webllm.MLCEngine
): Promise<{ name: string; emoji: string; type: string }> {
  const llm = engineInstance || engine;
  if (!llm) throw new Error("WebLLM engine not initialized");

  const prompt = `You are an alchemy game engine. Given two elements, create a new element that would result from combining them.

Rules:
- Output ONLY valid JSON: {"name":"Element Name","emoji":"single_emoji","type":"one_of_energy_liquid_life_cosmic_matter_gas"}
- The name should be creative but logical (1-2 words)
- Use a single emoji that represents the element
- Type must be exactly one of: energy, liquid, life, cosmic, matter, gas

Examples:
Fire + Water = {"name":"Steam","emoji":"♨️","type":"gas"}
Earth + Water = {"name":"Mud","emoji":"💩","type":"liquid"}
Sun + Plant = {"name":"Flower","emoji":"🌸","type":"life"}
Metal + Energy = {"name":"Electricity","emoji":"💡","type":"energy"}
Star + Void = {"name":"Black Hole","emoji":"🕳️","type":"cosmic"}

Now respond with ONLY the JSON object (no markdown, no extra text):
${elementA.name} + ${elementB.name} = `;

  const messages: webllm.ChatCompletionMessageParam[] = [
    { role: "system", content: "You are an alchemy game engine. Output ONLY valid JSON." },
    { role: "user", content: prompt }
  ];

  const reply = await llm.chat.completions.create({
    messages,
    temperature: 0.8,
    max_tokens: 64,
  });

  const raw = reply.choices[0].message.content || "";
  return parseAIResponse(raw);
}

function parseAIResponse(raw: string): { name: string; emoji: string; type: string } {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.name && parsed.emoji && parsed.type) {
        const validTypes = ['energy', 'liquid', 'life', 'cosmic', 'matter', 'gas'];
        const type = validTypes.includes(parsed.type) ? parsed.type : 'matter';
        return {
          name: String(parsed.name).slice(0, 30),
          emoji: String(parsed.emoji).slice(0, 2),
          type,
        };
      }
    }
  } catch {
    // fallback below
  }

  return { name: 'Mystery', emoji: '❓', type: 'matter' };
}