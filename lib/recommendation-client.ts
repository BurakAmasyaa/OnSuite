import {
  getRecommendationPlan,
  getStage1ProductCandidates,
  getStage2ModuleCandidates,
  recommendSolution,
  unknownSummary,
  type RecommendationCandidateModule,
  type RecommendationCandidateProduct,
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

function parseFastPathResult(
  value: unknown,
  candidates: { products: RecommendationCandidateProduct[]; modules: RecommendationCandidateModule[] },
): RecommendationResult {
  if (!isRecord(value) || !Array.isArray(value.productIds) || !Array.isArray(value.modules)) {
    throw new Error("Invalid recommendation response");
  }

  const candidateProducts = new Set(candidates.products.map((product) => product.id));
  const candidateModules = new Map(candidates.modules.map((module) => [`${module.productId}:${module.id}`, module]));
  const products = value.productIds.filter((id): id is string => typeof id === "string" && candidateProducts.has(id))
    .slice(0, 3).map((id) => ({ id }));
  const modules = value.modules.filter(isRecord).filter((module) => (
    typeof module.id === "string" &&
    typeof module.productId === "string" &&
    candidateModules.has(`${module.productId}:${module.id}`)
  )).slice(0, 6).map((module) => ({
    id: module.id as string,
    productId: module.productId as string,
  }));

  // An empty selection is a legitimate AI answer (the need doesn't match the
  // OnSuite catalog), not an error — it must not be masked by the local
  // fallback, so it's returned as-is rather than thrown.
  const isNoMatch = products.length === 0 && modules.length === 0;

  return {
    summary: isNoMatch ? unknownSummary : genericSummary,
    products,
    modules,
  };
}

function parseStage1Result(value: unknown, candidates: RecommendationStage1Product[]): string[] {
  if (!isRecord(value) || !Array.isArray(value.productIds)) {
    throw new Error("Invalid stage 1 response");
  }

  const candidateProductIds = new Set(candidates.map((product) => product.id));
  return [...new Set(value.productIds.filter((id): id is string => typeof id === "string" && candidateProductIds.has(id)))].slice(0, 3);
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

async function runFastPath(
  userNeed: string,
  endpoint: string,
  candidates: { products: RecommendationCandidateProduct[]; modules: RecommendationCandidateModule[] },
  localResult: RecommendationResult,
): Promise<RecommendationResult> {
  try {
    const raw = await postRecommendation(endpoint, "/recommend", { userNeed, products: candidates.products, modules: candidates.modules });
    const aiResult = parseFastPathResult(raw, candidates);
    const aiIsEmpty = aiResult.products.length === 0 && aiResult.modules.length === 0;
    const localIsVerifiedMatch = localResult.products.length > 0 || localResult.modules.length > 0;

    // A verified local fast-path match is trusted over an AI response that
    // came back empty (model uncertainty, JSON-mode quirk, etc). An empty AI
    // answer only counts as a genuine no-match on the broad/semantic path,
    // where there was no local keyword signal to begin with.
    if (aiIsEmpty && localIsVerifiedMatch) {
      return localResult;
    }

    return aiResult;
  } catch {
    return localResult;
  }
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

  let productIds: string[];
  try {
    const raw = await postRecommendation(endpoint, "/recommend/products", { userNeed, products: stage1Candidates });
    productIds = parseStage1Result(raw, stage1Candidates);
  } catch {
    return { summary: unknownSummary, products: [], modules: [] };
  }

  if (productIds.length === 0) {
    return { summary: unknownSummary, products: [], modules: [] };
  }

  const products = productIds.map((id) => ({ id }));
  const stage2Candidates = getStage2ModuleCandidates(productIds);

  if (stage2Candidates.length === 0) {
    return { summary: genericSummary, products, modules: [] };
  }

  try {
    const raw = await postRecommendation(endpoint, "/recommend/modules", { userNeed, modules: stage2Candidates });
    const modules = parseStage2Result(raw, stage2Candidates);
    return { summary: genericSummary, products, modules };
  } catch {
    // Stage 1's verified product selection still stands even if Stage 2
    // (module refinement) fails — don't discard a real partial result.
    return { summary: genericSummary, products, modules: [] };
  }
}

export async function getAIRecommendation(userNeed: string): Promise<RecommendationResult> {
  const localResult = recommendSolution(userNeed);
  const plan = getRecommendationPlan(userNeed);
  const endpoint = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL?.trim();

  if (!endpoint || !plan) {
    return localResult;
  }

  if (plan.mode === "fast") {
    return runFastPath(userNeed, endpoint, plan, localResult);
  }

  return runBroadPath(userNeed, endpoint);
}
