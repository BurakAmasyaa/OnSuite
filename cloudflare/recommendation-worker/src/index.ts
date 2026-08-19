const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const MAX_NEED_LENGTH = 1000;
const MAX_PRODUCTS = 8;
const MAX_MODULES = 12;

type CandidateProduct = { id: string; name: string; description: string };
type CandidateModule = { id: string; productId: string; name: string; description: string };
type RecommendationRequest = { userNeed: string; products: CandidateProduct[]; modules: CandidateModule[] };
type AIRecommendationSelection = { productIds: string[]; modules: { id: string; productId: string }[] };
type AiBinding = { run: (model: string, options: Record<string, unknown>) => Promise<unknown> };
type Env = { AI: AiBinding; ALLOWED_ORIGINS?: string };

const SYSTEM_PROMPT = `You are only an ID selection engine.
Select the smallest useful set of IDs from the supplied candidate list.
You must select only IDs from the supplied candidates and never invent an ID.
You must never generate OnSuite product facts, capabilities, descriptions, reasons, benefits, or technical claims.
Return only the requested structured IDs.`;

const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "onsuite_recommendation_selection",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["productIds", "modules"],
      properties: {
        productIds: { type: "array", maxItems: 3, items: { type: "string" } },
        modules: {
          type: "array",
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "productId"],
            properties: { id: { type: "string" }, productId: { type: "string" } },
          },
        },
      },
    },
  },
};

function allowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean);
}

function corsHeaders(request: Request, env: Env) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  });
  const origin = request.headers.get("Origin");
  if (origin && allowedOrigins(env).includes(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return headers;
}

function jsonResponse(request: Request, env: Env, body: unknown, status = 200) {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCandidateProduct(value: unknown): value is CandidateProduct {
  return isRecord(value) && typeof value.id === "string" && value.id.length <= 80 && typeof value.name === "string" && value.name.length <= 160 && typeof value.description === "string" && value.description.length <= 600;
}

function isCandidateModule(value: unknown): value is CandidateModule {
  return isRecord(value) && typeof value.id === "string" && value.id.length <= 80 && typeof value.productId === "string" && value.productId.length <= 80 && typeof value.name === "string" && value.name.length <= 160 && typeof value.description === "string" && value.description.length <= 600;
}

function validateRequest(value: unknown): RecommendationRequest {
  if (!isRecord(value) || typeof value.userNeed !== "string" || !value.userNeed.trim() || value.userNeed.length > MAX_NEED_LENGTH) throw new Error("Invalid userNeed");
  if (!Array.isArray(value.products) || value.products.length > MAX_PRODUCTS || !value.products.every(isCandidateProduct)) throw new Error("Invalid products");
  if (!Array.isArray(value.modules) || value.modules.length > MAX_MODULES || !value.modules.every(isCandidateModule)) throw new Error("Invalid modules");

  const productIds = new Set(value.products.map((product) => product.id));
  const moduleKeys = new Set<string>();
  for (const module of value.modules) {
    const key = `${module.productId}:${module.id}`;
    if (!productIds.has(module.productId) || moduleKeys.has(key)) throw new Error("Invalid candidate relationship");
    moduleKeys.add(key);
  }
  return { userNeed: value.userNeed.trim(), products: value.products, modules: value.modules };
}

function parseModelResponse(value: unknown): AIRecommendationSelection {
  const response = isRecord(value) && "response" in value ? value.response : value;
  const text = typeof response === "string" ? response.replace(/^```json\s*|\s*```$/g, "") : JSON.stringify(response);
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed) || !Array.isArray(parsed.productIds) || !Array.isArray(parsed.modules)) throw new Error("Malformed model response");
  return {
    productIds: parsed.productIds.filter((id): id is string => typeof id === "string"),
    modules: parsed.modules.filter((module): module is { id: string; productId: string } => isRecord(module) && typeof module.id === "string" && typeof module.productId === "string"),
  };
}

function validateSelection(selection: AIRecommendationSelection, request: RecommendationRequest) {
  const productIds = new Set(request.products.map((product) => product.id));
  const moduleKeys = new Set(request.modules.map((module) => `${module.productId}:${module.id}`));
  const validProductIds = [...new Set(selection.productIds)].filter((id) => productIds.has(id)).slice(0, 3);
  const validModules = selection.modules.filter((module) => moduleKeys.has(`${module.productId}:${module.id}`)).slice(0, 6);
  if (validProductIds.length === 0 && validModules.length === 0) throw new Error("No valid selection");
  return { productIds: validProductIds, modules: validModules };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const origins = allowedOrigins(env);
    if (origin && !origins.includes(origin)) return jsonResponse(request, env, { error: "origin_not_allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/recommend") return jsonResponse(request, env, { error: "not_found" }, 404);

    let recommendationRequest: RecommendationRequest;
    try {
      recommendationRequest = validateRequest(await request.json());
    } catch {
      return jsonResponse(request, env, { error: "invalid_request" }, 400);
    }

    try {
      const response = await env.AI.run(MODEL, {
        temperature: 0.15,
        response_format: RESPONSE_FORMAT,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ userNeed: recommendationRequest.userNeed, products: recommendationRequest.products, modules: recommendationRequest.modules }) },
        ],
      });
      return jsonResponse(request, env, validateSelection(parseModelResponse(response), recommendationRequest));
    } catch {
      return jsonResponse(request, env, { error: "recommendation_unavailable" }, 502);
    }
  },
};
