/**
 * Mini API proxy pour relayer les requêtes IA vers Ollama.
 * Évite le CORS cross-subdomain en s'exécutant sur le même domaine que le frontend.
 */
const OLLAMA_URL = process.env.OLLAMA_API_URL || "http://ollamacoolify-ollama-1:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (url.pathname !== "/api/ai" || request.method !== "POST") {
      return new Response("Not found", { status: 404 });
    }

    try {
      const body = await request.json();
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: body.prompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 80 },
        }),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
