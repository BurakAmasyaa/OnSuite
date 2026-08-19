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
  if (!isRecord(value) || typeof value.summary !== "string" || !Array.isArray(value.products) || !Array.isArray(value.modules)) {
    throw new Error("Invalid recommendation response");
  }

  const candidateProducts = new Set(candidates.products.map((product) => product.id));
  const candidateModules = new Map(candidates.modules.map((module) => [`${module.productId}:${module.id}`, module]));
  const products = value.products.filter(isRecord).filter((product) => (
    typeof product.id === "string" &&
    typeof product.reason === "string" &&
    candidateProducts.has(product.id)
  )).slice(0, 3).map((product) => ({
    id: product.id as string,
    reason: (product.reason as string).slice(0, 280),
  }));
  const modules = value.modules.filter(isRecord).filter((module) => (
    typeof module.id === "string" &&
    typeof module.productId === "string" &&
    typeof module.reason === "string" &&
    candidateModules.has(`${module.productId}:${module.id}`)
  )).slice(0, 6).map((module) => ({
    id: module.id as string,
    productId: module.productId as string,
    reason: (module.reason as string).slice(0, 280),
  }));

  if (!value.summary.trim() || (products.length === 0 && modules.length === 0)) {
    throw new Error("Recommendation response has no valid candidates");
  }

  return {
    summary: value.summary.slice(0, 600),
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