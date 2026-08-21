import {
  composeRecommendation,
  emptyRecommendation,
  getRecommendationPlan,
  getStage1ProductCandidates,
  getStage2ModuleCandidates,
  recommendSolution,
  unknownSummary,
  type RecommendationCandidateModule,
  type RecommendationResult,
  type RecommendationStage1Product,
} from "@/lib/recommend-solution";

const recommendationTimeoutMs = 7000;
const genericSummary = "İhtiyacınıza göre aşağıdaki OnSuite ürün ve modülleri eşleşti.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function postRecommendation(endpoint: string, path: string, body: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), recommendationTimeoutMs);

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Recommendation request failed: ${path}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeout);
  }
}

/** A stage 1 pick plus the part of the request it answers, which stage 2
 * uses to scope its module choices. */
type Stage1Pick = { productId: string; need: string };

function parseStage1Result(value: unknown, candidates: RecommendationStage1Product[]): Stage1Pick[] {
  if (!isRecord(value) || !Array.isArray(value.productIds)) {
    throw new Error("Invalid stage 1 response");
  }

  const candidateProductIds = new Set(candidates.map((product) => product.id));
  const needByProductId = new Map<string, string>();
  if (Array.isArray(value.selections)) {
    for (const entry of value.selections) {
      if (isRecord(entry) && typeof entry.productId === "string" && typeof entry.need === "string") {
        needByProductId.set(entry.productId, entry.need);
      }
    }
  }

  const productIds = [...new Set(value.productIds.filter(
    (id): id is string => typeof id === "string" && candidateProductIds.has(id),
  ))].slice(0, 3);

  return productIds.map((productId) => ({ productId, need: needByProductId.get(productId) ?? "" }));
}

function parseStage2Result(value: unknown, candidates: RecommendationCandidateModule[]): RecommendationResult["modules"] {
  if (!isRecord(value) || !Array.isArray(value.modules)) {
    throw new Error("Invalid stage 2 response");
  }

  const candidateModules = new Set(candidates.map((module) => `${module.productId}:${module.id}`));
  return value.modules.filter(isRecord).filter((module) => (
    typeof module.id === "string" &&
    typeof module.productId === "string" &&
    candidateModules.has(`${module.productId}:${module.id}`)
  )).slice(0, 6).map((module) => ({
    id: module.id as string,
    productId: module.productId as string,
  }));
}

/**
 * Two-stage broad/semantic path: Stage 1 picks candidate products from the
 * full canonical catalog (official-description-only candidates), and only
 * if that comes back non-empty does Stage 2 run — scoped to just the
 * selected products' modules. A Stage-1 empty selection is a genuine
 * no-match and skips Stage 2 entirely (no second inference call).
 */
async function runBroadPath(userNeed: string, endpoint: string): Promise<RecommendationResult> {
  const stage1Candidates = getStage1ProductCandidates();

  let picks: Stage1Pick[];
  try {
    const raw = await postRecommendation(endpoint, "/recommend/products", { userNeed, products: stage1Candidates });
    picks = parseStage1Result(raw, stage1Candidates);
  } catch {
    return emptyRecommendation(unknownSummary);
  }

  if (picks.length === 0) {
    return emptyRecommendation(unknownSummary);
  }

  const productIds = picks.map((pick) => pick.productId);

  // Stage 2 is scoped to the model's own picks: the platform products added
  // by composeRecommendation are architectural context, not a signal that the
  // user asked for their modules.
  const stage2Candidates = getStage2ModuleCandidates(productIds);

  if (stage2Candidates.length === 0) {
    return composeRecommendation(productIds, [], genericSummary);
  }

  try {
    // Pass stage 1's reasoning along so module picks are scoped per product
    // rather than to the request as a whole.
    const selections = picks.filter((pick) => pick.need !== "");
    const raw = await postRecommendation(endpoint, "/recommend/modules", {
      userNeed,
      modules: stage2Candidates,
      ...(selections.length > 0 ? { selections } : {}),
    });
    const modules = parseStage2Result(raw, stage2Candidates);
    return composeRecommendation(productIds, modules, genericSummary);
  } catch {
    // Stage 1's verified product selection still stands even if Stage 2
    // (module refinement) fails — don't discard a real partial result.
    return composeRecommendation(productIds, [], genericSummary);
  }
}

export async function getAIRecommendation(userNeed: string): Promise<RecommendationResult> {
  const plan = getRecommendationPlan(userNeed);

  // Empty or keyboard-mash input is the one case worth answering without an
  // inference: there is no need to understand.
  if (!plan) {
    return emptyRecommendation(unknownSummary);
  }

  const endpoint = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL?.trim();
  if (!endpoint) {
    return recommendSolution(userNeed);
  }

  // Every real need goes to the model. Keyword rules can only match what
  // someone thought to list, so they answered confidently and wrongly on
  // phrasings they did not cover; they are the fallback now, not the gate.
  const aiResult = await runBroadPath(userNeed, endpoint);
  if (aiResult.products.length > 0 || aiResult.standaloneProducts.length > 0) {
    return aiResult;
  }

  // The model found nothing (or the call failed). A local keyword match is
  // still better than an empty answer.
  const localResult = recommendSolution(userNeed);
  return localResult.products.length > 0 ? localResult : aiResult;
}
