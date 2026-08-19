const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const MAX_NEED_LENGTH = 1000;
const MAX_PRODUCTS = 8;
const MAX_MODULES = 12;

type CandidateProduct = {
  id: string;
  name: string;
  description: string;
};

type CandidateModule = {
  id: string;
  productId: string;
  name: string;
  description: string;
};

type RecommendationRequest = {
  userNeed: string;
  products: CandidateProduct[];
  modules: CandidateModule[];
};

type RecommendationResult = {
  summary: string;
  products: { id: string; reason: string }[];
  modules: { id: string; productId: string; reason: string }[];
};

type AiBinding = {
  run: (model: string, options: Record<string, unknown>) => Promise<unknown>;
};

type Env = {
  AI: AiBinding;
  ALLOWED_ORIGINS?: string;
};

const SYSTEM_PROMPT = `You are an OnSuite solution recommendation engine.
The user describes an industrial or production need.
You receive a fixed list of candidate OnSuite products and modules.
Select only from the candidate IDs provided. Never invent an ID or recommend outside the candidates.
Select the smallest useful solution set: 1-3 products and at most 6 modules.
Explain recommendations briefly in Turkish. Do not use sales language or unsupported technical claims.
Return only the requested JSON object.`;

const RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "onsuite_recommendation",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "products", "modules"],
      properties: {
        summary: { type: "string" },
        products: {
          type: "array",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "reason"],
            properties: { id: { type: "string" }, reason: { type: "string" } },
          },
        },
        modules: {
          type: "array",
          maxItems: 6,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["id", "productId", "reason"],
            properties: {
              id: { type: "string" },
              productId: { type: "string" },
              reason: { type: "string" },
            },
          },
        },
      },
    },
  },
};

function allowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  const headers = new Headers({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  });

  if (origin && allowedOrigins(env).includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

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
  return isRecord(value) &&
    typeof value.id === "string" && value.id.length <= 80 &&
    typeof value.name === "string" && value.name.length <= 160 &&
    typeof value.description === "string" && value.description.length <= 600;
}

function isCandidateModule(value: unknown): value is CandidateModule {
  return isRecord(value) &&
    typeof value.id === "string" && value.id.length <= 80 &&
    typeof value.productId === "string" && value.productId.length <= 80 &&
    typeof value.name === "string" && value.name.length <= 160 &&
    typeof value.description === "string" && value.description.length <= 600;
}

function validateRequest(value: unknown): RecommendationRequest {
  if (!isRecord(value) || typeof value.userNeed !== "string" || !value.userNeed.trim() || value.userNeed.length > MAX_NEED_LENGTH) {
    throw new Error("Invalid userNeed");
  }

  if (!Array.isArray(value.products) || value.products.length > MAX_PRODUCTS || !value.products.every(isCandidateProduct)) {
    throw new Error("Invalid products");
  }

  if (!Array.isArray(value.modules) || value.modules.length > MAX_MODULES || !value.modules.every(isCandidateModule)) {
    throw new Error("Invalid modules");
  }

  const productIds = new Set(value.products.map((product) => product.id));
  const moduleKeys = new Set<string>();

  for (const module of value.modules) {
    const key = `${module.productId}:${module.id}`;

    if (!productIds.has(module.productId) || moduleKeys.has(key)) {
      throw new Error("Invalid candidate relationship");
    }

    moduleKeys.add(key);
  }

  return {
    userNeed: value.userNeed.trim(),
    products: value.products,
    modules: value.modules,
  };
}

function parseModelResponse(value: unknown): RecommendationResult {
  const response = isRecord(value) && "response" in value ? value.response : value;
  const text = typeof response === "string" ? response.replace(/^```json\s*|\s*```$/g, "") : JSON.stringify(response);
  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed) || typeof parsed.summary !== "string" || !Array.isArray(parsed.products) || !Array.isArray(parsed.modules)) {
    throw new Error("Malformed model response");
  }

  return {
    summary: parsed.summary,
    products: parsed.products as RecommendationResult["products"],
    modules: parsed.modules as RecommendationResult["modules"],
  };
}

function validateModelResult(result: RecommendationResult, request: RecommendationRequest) {
  const productIds = new Set(request.products.map((product) => product.id));
  const moduleKeys = new Set(request.modules.map((module) => `${module.productId}:${module.id}`));
  const products = result.products.filter((product) => productIds.has(product.id) && typeof product.reason === "string").slice(0, 3);
  const modules = result.modules.filter((module) => (
    moduleKeys.has(`${module.productId}:${module.id}`) && typeof module.reason === "string"
  )).slice(0, 6);

  if (!result.summary.trim() || (products.length === 0 && modules.length === 0)) {
    throw new Error("No valid model recommendations");
  }

  return { summary: result.summary.slice(0, 600), products, modules };
}

async function recommend(request: RecommendationRequest, env: Env) {
  const modelResponse = await env.AI.run(MODEL, {
    temperature: 0.15,
    response_format: RESPONSE_FORMAT,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify({ userNeed: request.userNeed, products: request.products, modules: request.modules }) },
    ],
  });

  return validateModelResult(parseModelResponse(modelResponse), request);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const origins = allowedOrigins(env);

    if (origin && !origins.includes(origin)) {
      return jsonResponse(request, env, { error: "origin_not_allowed" }, 403);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);

    if (request.method !== "POST" || url.pathname !== "/recommend") {
      return jsonResponse(request, env, { error: "not_found" }, 404);
    }

    let recommendationRequest: RecommendationRequest;

    try {
      recommendationRequest = validateRequest(await request.json());
    } catch {
      return jsonResponse(request, env, { error: "invalid_request" }, 400);
    }

    try {
      return jsonResponse(request, env, await recommend(recommendationRequest, env));
    } catch {
      return jsonResponse(request, env, { error: "recommendation_unavailable" }, 502);
    }
  },
};