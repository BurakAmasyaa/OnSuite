import {
  getRecommendationCandidates,
  recommendSolution,
  type RecommendationCandidates,
  type RecommendationResult,
} from "@/lib/recommend-solution";

const recommendationTimeoutMs = 7000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseRecommendationResult(value: unknown, candidates: RecommendationCandidates): RecommendationResult {
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

  if (products.length === 0 && modules.length === 0) {
    throw new Error("Recommendation response has no valid candidates");
  }

  return {
    summary: "İhtiyacınıza göre aşağıdaki OnSuite ürün ve modülleri eşleşti.",
    products,
    modules,
  };
}

export async function getAIRecommendation(userNeed: string): Promise<RecommendationResult> {
  const localResult = recommendSolution(userNeed);
  const candidates = getRecommendationCandidates(userNeed);
  const endpoint = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL?.trim();

  if (!endpoint || !candidates) {
    return localResult;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), recommendationTimeoutMs);

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userNeed, ...candidates }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Recommendation request failed");
    }

    return parseRecommendationResult(await response.json(), candidates);
  } catch {
    return localResult;
  } finally {
    window.clearTimeout(timeout);
  }
}