const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const MAX_NEED_LENGTH = 1000;
const MAX_PRODUCTS = 20;
const MAX_MODULES = 200;
const MAX_OUTPUT_TOKENS = 400;

type CandidateProduct = { id: string; name: string; description: string };
type CandidateModule = { id: string; productId: string; name: string; description: string };
type RecommendationRequest = { userNeed: string; products: CandidateProduct[]; modules: CandidateModule[] };
type AIRecommendationSelection = { productIds: string[]; modules: { id: string; productId: string }[] };
type AiBinding = { run: (model: string, options: Record<string, unknown>) => Promise<unknown> };
type Env = { AI: AiBinding; ALLOWED_ORIGINS?: string };

const SYSTEM_PROMPT = `You are an OnSuite product/module selection engine.
Understand the user's production/industrial need semantically, not only through exact keyword matching. Many needs are written as natural Turkish sentences with no exact keyword overlap with the catalog text — read them for meaning, not literal string matches.
You are given a fixed canonical candidate catalog of OnSuite products and modules.
Select only IDs from this catalog. Never invent an ID.
Never invent OnSuite facts, capabilities, reasons, benefits, or descriptions.
If the user's request is unrelated to the supplied OnSuite catalog, return empty arrays for both productIds and modules — this is a valid answer, not a failure.
Prefer the smallest useful product/module set that addresses the need.
Return only the required structured output.`;

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
  // An empty result (model said no match, or every returned id failed the
  // allowlist check) is a valid answer and must be returned as-is, not
  // treated as a request failure.
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
        temperature: 0.1,
        max_tokens: MAX_OUTPUT_TOKENS,
        stream: false,
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
