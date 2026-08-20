const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const MAX_NEED_LENGTH = 1000;
const MAX_PRODUCTS = 20;
const MAX_MODULES = 200;
const MAX_STAGE1_PRODUCTS = 20;
const MAX_STAGE2_MODULES = 80;
const MAX_OUTPUT_TOKENS = 400;

type CandidateProduct = { id: string; name: string; description: string };
type CandidateModule = { id: string; productId: string; name: string; description: string };
type Stage1Product = { id: string; name: string; officialDescription: string };
type RecommendationRequest = { userNeed: string; products: CandidateProduct[]; modules: CandidateModule[] };
type Stage1Request = { userNeed: string; products: Stage1Product[] };
type Stage2Request = { userNeed: string; modules: CandidateModule[] };
type AIRecommendationSelection = { productIds: string[]; modules: { id: string; productId: string }[] };
type Stage1Selection = { productIds: string[] };
type Stage2Selection = { modules: { id: string; productId: string }[] };
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

const STAGE1_SYSTEM_PROMPT = `You are an OnSuite product selection engine.
Understand the user's production/industrial need semantically, in Turkish or English, not only through exact keyword matching. Many needs are written as natural sentences with no exact keyword overlap with the candidate text — read them for meaning.
You are given a fixed list of OnSuite products, each with an id, a name, and an official short description.
Select only product IDs from this list. Never invent an ID.
Do not assume any product fact, capability, or description beyond what is given in the candidate list.
Prefer the smallest useful solution: usually a single product, and no more than two unless the need clearly spans a third, distinct area that your top picks do not cover. Select at most 3 product IDs.
Some products are infrastructure/platform layers rather than solutions on their own — their own description talks about a central/shared platform, or about connecting machines and collecting field data (for example Core and Connect). Include one of these only when the need explicitly asks for machine/system connectivity, field data collection, protocol integration, or a central/shared platform. Do not add them just because they generally support other products.
If the request is unrelated to the supplied OnSuite products, return an empty productIds array — this is a valid answer, not a failure.
Return only the required structured output.`;

const STAGE2_SYSTEM_PROMPT = `You are an OnSuite module selection engine.
You are given the user's original production/industrial need again, plus a fixed list of modules that belong only to the OnSuite products already selected for this need.
Select only module IDs (each paired with its productId) from this list. Never invent an id or a productId that is not present in the list.
Do not assume any module fact, capability, or description beyond what is given in the candidate list.
Select at most 6 modules that best address the need.
If none of the supplied modules clearly address the need, return an empty modules array — this is a valid answer, not a failure.
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

const STAGE1_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "onsuite_product_selection",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["productIds"],
      properties: {
        productIds: { type: "array", maxItems: 3, items: { type: "string" } },
      },
    },
  },
};

const STAGE2_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "onsuite_module_selection",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["modules"],
      properties: {
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

function isNeed(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_NEED_LENGTH;
}

function isCandidateProduct(value: unknown): value is CandidateProduct {
  return isRecord(value) && typeof value.id === "string" && value.id.length <= 80 && typeof value.name === "string" && value.name.length <= 160 && typeof value.description === "string" && value.description.length <= 600;
}

function isCandidateModule(value: unknown): value is CandidateModule {
  return isRecord(value) && typeof value.id === "string" && value.id.length <= 80 && typeof value.productId === "string" && value.productId.length <= 80 && typeof value.name === "string" && value.name.length <= 160 && typeof value.description === "string" && value.description.length <= 600;
}

function isStage1Product(value: unknown): value is Stage1Product {
  return isRecord(value) && typeof value.id === "string" && value.id.length <= 80 && typeof value.name === "string" && value.name.length <= 160 && typeof value.officialDescription === "string" && value.officialDescription.length <= 600;
}

function validateRequest(value: unknown): RecommendationRequest {
  if (!isRecord(value) || !isNeed(value.userNeed)) throw new Error("Invalid userNeed");
  if (!Array.isArray(value.products) || value.products.length > MAX_PRODUCTS || !value.products.every(isCandidateProduct)) throw new Error("Invalid products");
  if (!Array.isArray(value.modules) || value.modules.length > MAX_MODULES || !value.modules.every(isCandidateModule)) throw new Error("Invalid modules");

  const productIds = new Set(value.products.map((product) => product.id));
  const moduleKeys = new Set<string>();
  for (const module of value.modules) {
    const key = `${module.productId}:${module.id}`;
    if (!productIds.has(module.productId) || moduleKeys.has(key)) throw new Error("Invalid candidate relationship");
    moduleKeys.add(key);
  }
  return { userNeed: (value.userNeed as string).trim(), products: value.products, modules: value.modules };
}

function validateStage1Request(value: unknown): Stage1Request {
  if (!isRecord(value) || !isNeed(value.userNeed)) throw new Error("Invalid userNeed");
  if (!Array.isArray(value.products) || value.products.length > MAX_STAGE1_PRODUCTS || !value.products.every(isStage1Product)) throw new Error("Invalid products");
  return { userNeed: (value.userNeed as string).trim(), products: value.products };
}

function validateStage2Request(value: unknown): Stage2Request {
  if (!isRecord(value) || !isNeed(value.userNeed)) throw new Error("Invalid userNeed");
  if (!Array.isArray(value.modules) || value.modules.length > MAX_STAGE2_MODULES || !value.modules.every(isCandidateModule)) throw new Error("Invalid modules");
  return { userNeed: (value.userNeed as string).trim(), modules: value.modules };
}

function parseStructuredResponse(value: unknown): unknown {
  const response = isRecord(value) && "response" in value ? value.response : value;
  const text = typeof response === "string" ? response.replace(/^```json\s*|\s*```$/g, "") : JSON.stringify(response);
  return JSON.parse(text);
}

function parseModelResponse(value: unknown): AIRecommendationSelection {
  const parsed = parseStructuredResponse(value);
  if (!isRecord(parsed) || !Array.isArray(parsed.productIds) || !Array.isArray(parsed.modules)) throw new Error("Malformed model response");
  return {
    productIds: parsed.productIds.filter((id): id is string => typeof id === "string"),
    modules: parsed.modules.filter((module): module is { id: string; productId: string } => isRecord(module) && typeof module.id === "string" && typeof module.productId === "string"),
  };
}

function parseStage1Response(value: unknown): Stage1Selection {
  const parsed = parseStructuredResponse(value);
  if (!isRecord(parsed) || !Array.isArray(parsed.productIds)) throw new Error("Malformed stage 1 model response");
  return { productIds: parsed.productIds.filter((id): id is string => typeof id === "string") };
}

function parseStage2Response(value: unknown): Stage2Selection {
  const parsed = parseStructuredResponse(value);
  if (!isRecord(parsed) || !Array.isArray(parsed.modules)) throw new Error("Malformed stage 2 model response");
  return {
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

function validateStage1Selection(selection: Stage1Selection, request: Stage1Request) {
  const productIds = new Set(request.products.map((product) => product.id));
  // Empty is a valid answer (irrelevant request, or every id hallucinated) —
  // returned as-is, never treated as a failure.
  return { productIds: [...new Set(selection.productIds)].filter((id) => productIds.has(id)).slice(0, 3) };
}

function validateStage2Selection(selection: Stage2Selection, request: Stage2Request) {
  const moduleKeys = new Set(request.modules.map((module) => `${module.productId}:${module.id}`));
  // Filtering against the (already product-scoped) candidate list is what
  // guarantees the model can never select another product's module.
  return { modules: selection.modules.filter((module) => moduleKeys.has(`${module.productId}:${module.id}`)).slice(0, 6) };
}

async function handleFastPath(request: Request, env: Env): Promise<Response> {
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
}

async function handleStage1(request: Request, env: Env): Promise<Response> {
  let stage1Request: Stage1Request;
  try {
    stage1Request = validateStage1Request(await request.json());
  } catch {
    return jsonResponse(request, env, { error: "invalid_request" }, 400);
  }

  try {
    const response = await env.AI.run(MODEL, {
      temperature: 0.1,
      max_tokens: MAX_OUTPUT_TOKENS,
      stream: false,
      response_format: STAGE1_RESPONSE_FORMAT,
      messages: [
        { role: "system", content: STAGE1_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify({ userNeed: stage1Request.userNeed, products: stage1Request.products }) },
      ],
    });
    return jsonResponse(request, env, validateStage1Selection(parseStage1Response(response), stage1Request));
  } catch {
    return jsonResponse(request, env, { error: "recommendation_unavailable" }, 502);
  }
}

async function handleStage2(request: Request, env: Env): Promise<Response> {
  let stage2Request: Stage2Request;
  try {
    stage2Request = validateStage2Request(await request.json());
  } catch {
    return jsonResponse(request, env, { error: "invalid_request" }, 400);
  }

  try {
    const response = await env.AI.run(MODEL, {
      temperature: 0.1,
      max_tokens: MAX_OUTPUT_TOKENS,
      stream: false,
      response_format: STAGE2_RESPONSE_FORMAT,
      messages: [
        { role: "system", content: STAGE2_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify({ userNeed: stage2Request.userNeed, modules: stage2Request.modules }) },
      ],
    });
    return jsonResponse(request, env, validateStage2Selection(parseStage2Response(response), stage2Request));
  } catch {
    return jsonResponse(request, env, { error: "recommendation_unavailable" }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const origins = allowedOrigins(env);
    if (origin && !origins.includes(origin)) return jsonResponse(request, env, { error: "origin_not_allowed" }, 403);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });

    const url = new URL(request.url);
    if (request.method !== "POST") return jsonResponse(request, env, { error: "not_found" }, 404);

    if (url.pathname === "/recommend") return handleFastPath(request, env);
    if (url.pathname === "/recommend/products") return handleStage1(request, env);
    if (url.pathname === "/recommend/modules") return handleStage2(request, env);
    return jsonResponse(request, env, { error: "not_found" }, 404);
  },
};
