import { getOfficialProductDescription, modules, products } from "@/lib/data";

export type RecommendationProduct = { id: string };
export type RecommendationModule = { id: string; productId: string };
export type RecommendationResult = {
  summary: string;
  products: RecommendationProduct[];
  modules: RecommendationModule[];
};

export type RecommendationCandidateProduct = {
  id: string;
  name: string;
  description: string;
};
export type RecommendationCandidateModule = {
  id: string;
  productId: string;
  name: string;
  description: string;
};
/** Stage 1 (broad path) product candidate: description is sourced only from
 * the verified onsuite.com.tr canonical data, never fabricated. */
export type RecommendationStage1Product = {
  id: string;
  name: string;
  officialDescription: string;
};

/**
 * "fast": a local keyword rule matched — products/modules are the narrow,
 * pre-scored candidate set for the existing single-call flow (unchanged).
 * "broad": no local match — the caller runs the two-stage product-then-module
 * flow instead (see getStage1ProductCandidates / getStage2ModuleCandidates).
 */
export type RecommendationPlan =
  | { mode: "fast"; products: RecommendationCandidateProduct[]; modules: RecommendationCandidateModule[] }
  | { mode: "broad" };

type RecommendationRule = {
  terms: string[];
  products: string[];
  modules: RecommendationModule[];
};

const recommendationRules: RecommendationRule[] = [
  {
    terms: ["verimlil", "performans", "oee", "duruş", "fire", "bakım"],
    products: ["OEE", "MONITORA"],
    modules: [
      { id: "OEE", productId: "OEE" },
      { id: "DOWNTIME", productId: "OEE" },
      { id: "MAINT", productId: "OEE" },
      { id: "TRACEDASHBOARD", productId: "MONITORA" },
    ],
  },
  {
    terms: ["anlık", "gerçek zamanlı", "üretim takibi", "izlemek", "izleme"],
    products: ["MONITORA"],
    modules: [
      { id: "RPTREALTIME", productId: "MONITORA" },
      { id: "TRACEDASHBOARD", productId: "MONITORA" },
      { id: "ALARM", productId: "MONITORA" },
    ],
  },
  {
    terms: ["kalite", "hata", "kusur", "uygunsuz", "tamir"],
    products: ["İZLENEBILIRLIK"],
    modules: [
      { id: "BLOCKING", productId: "İZLENEBILIRLIK" },
      { id: "CHECKLIST", productId: "İZLENEBILIRLIK" },
      { id: "REPAIR_TRK", productId: "İZLENEBILIRLIK" },
      { id: "JIDOKA", productId: "İZLENEBILIRLIK" },
    ],
  },
  {
    terms: ["raporlama", "rapor", "görünürlük", "yönetim", "içgörü"],
    products: ["MONITORA", "INTELLIGENCE"],
    modules: [
      { id: "RPTPROCESS", productId: "MONITORA" },
      { id: "TRACEREPORT", productId: "MONITORA" },
      { id: "TRACEDASHBOARD", productId: "MONITORA" },
      { id: "VTINSIGHTQUERY", productId: "INTELLIGENCE" },
      { id: "VTINSIGHTANALYSIS", productId: "INTELLIGENCE" },
    ],
  },
  {
    terms: ["enerji", "tüketim", "sürdürülebilirlik"],
    products: ["OEE", "CARBONIQ"],
    modules: [
      { id: "ENERGY", productId: "OEE" },
      { id: "ENERGY", productId: "İZLENEBILIRLIK" },
      { id: "GRESUS", productId: "CARBONIQ" },
      { id: "GREINS", productId: "CARBONIQ" },
    ],
  },
  {
    terms: ["izlenebilir", "izlenebilirlik", "parti", "lot", "seri numarası", "ürün takibi"],
    products: ["İZLENEBILIRLIK"],
    modules: [
      { id: "LOT_MGMT", productId: "İZLENEBILIRLIK" },
      { id: "SN_MGMT", productId: "İZLENEBILIRLIK" },
      { id: "TRACEIDENTGATE", productId: "İZLENEBILIRLIK" },
      { id: "TRACEREPORT", productId: "İZLENEBILIRLIK" },
    ],
  },
];

const genericSummary = "İhtiyacınıza göre aşağıdaki OnSuite ürün ve modülleri eşleşti.";
export const unknownSummary = "İhtiyacınızı biraz daha detaylandırabilirsiniz. Üretimde geliştirmek istediğiniz alanı belirtin.";

const MAX_CANDIDATE_PRODUCTS = 20;
const MAX_CANDIDATE_MODULES = 200;
const MAX_STAGE2_MODULES = 80;

const normalizeNeed = (need: string) => need
  .toLocaleLowerCase("tr-TR")
  .replace(/[ıİ]/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

const GIBBERISH_CHECK_MIN_LENGTH = 6;
const GIBBERISH_MIN_UNIQUE_CHAR_RATIO = 0.45;

/**
 * Catches single-token keyboard-mash input (e.g. "sdasdasdsad") without
 * touching real natural-language input: multi-word text always passes
 * untouched, and short tokens (<=5 chars) are never flagged, so real
 * short acronyms/codes like "OEE" or "SPS" are unaffected. Only a single
 * token of at least 6 characters with unusually low character variety
 * (a hallmark of repetitive key-mashing, not real words) is rejected.
 */
function looksLikeGibberish(trimmedNeed: string): boolean {
  const words = trimmedNeed.split(/\s+/).filter(Boolean);
  if (words.length !== 1) return false;

  const token = normalizeNeed(words[0]).replace(/[^a-z0-9]/g, "");
  if (token.length < GIBBERISH_CHECK_MIN_LENGTH) return false;

  const uniqueCharRatio = new Set(token).size / token.length;
  return uniqueCharRatio < GIBBERISH_MIN_UNIQUE_CHAR_RATIO;
}

function getRecommendationMatches(userNeed: string) {
  const normalizedNeed = normalizeNeed(userNeed.trim());
  if (!normalizedNeed) return [];

  return recommendationRules
    .map((rule, index) => ({
      rule,
      index,
      score: rule.terms.reduce((score, term) => score + (normalizedNeed.includes(normalizeNeed(term)) ? 1 : 0), 0),
    }))
    .filter((match) => match.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index);
}

function buildFastCandidates(productIds: string[], moduleKeys: string[]): { products: RecommendationCandidateProduct[]; modules: RecommendationCandidateModule[] } {
  return {
    products: productIds.map((id) => {
      const product = products.find((item) => item.AppProductCode === id);
      return product ? {
        id,
        name: product.ProductTitleTR ?? product.ProductTitleEN ?? id,
        description: product.ProductShortDescriptionTR ?? product.ProductShortDescriptionEN ?? "",
      } : null;
    }).filter((item): item is RecommendationCandidateProduct => item !== null).slice(0, MAX_CANDIDATE_PRODUCTS),
    modules: moduleKeys.map((key) => {
      const [productId, id] = key.split(":");
      const moduleData = modules.find((item) => item.AppProductCode === productId && item.AppModuleCode === id);
      return moduleData ? {
        id,
        productId,
        name: moduleData.ModuleTitleTR ?? moduleData.ModuleTitleEN ?? id,
        description: moduleData.ModuleShortDescriptionTR ?? moduleData.ModuleShortDescriptionEN ?? "",
      } : null;
    }).filter((item): item is RecommendationCandidateModule => item !== null).slice(0, MAX_CANDIDATE_MODULES),
  };
}

/**
 * Local keyword rules are a fast-path ranking signal, not a hard gate: a
 * strong match narrows the candidate pool sent to the AI in a single call
 * (mode "fast", unchanged behavior). The absence of an exact keyword match
 * means the caller should run the two-stage broad flow instead (mode
 * "broad") — see getStage1ProductCandidates / getStage2ModuleCandidates.
 * Only empty input, or input that looks like keyboard-mash gibberish,
 * returns null (the AI call is skipped entirely).
 */
export function getRecommendationPlan(userNeed: string): RecommendationPlan | null {
  const trimmed = userNeed.trim();
  if (!trimmed) return null;

  const matches = getRecommendationMatches(trimmed);
  if (matches.length > 0) {
    const productIds = new Set<string>();
    const moduleKeys = new Set<string>();
    for (const { rule } of matches) {
      rule.products.forEach((id) => productIds.add(id));
      rule.modules.forEach((item) => moduleKeys.add(`${item.productId}:${item.id}`));
    }
    return { mode: "fast", ...buildFastCandidates([...productIds], [...moduleKeys]) };
  }

  if (looksLikeGibberish(trimmed)) return null;

  return { mode: "broad" };
}

/** Stage 1 candidates: all canonical products, with descriptions sourced
 * only from the verified onsuite.com.tr canonical data (never fabricated —
 * a product without a verified official page simply has an empty string). */
export function getStage1ProductCandidates(): RecommendationStage1Product[] {
  return products.map((product) => ({
    id: product.AppProductCode,
    name: product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode,
    officialDescription: getOfficialProductDescription(product.AppProductCode) ?? "",
  }));
}

/** Stage 2 candidates: only the modules belonging to the given (Stage 1
 * selected) product IDs, from the canonical Excel-derived module data. */
export function getStage2ModuleCandidates(productIds: string[]): RecommendationCandidateModule[] {
  const productIdSet = new Set(productIds);
  return modules
    .filter((module) => productIdSet.has(module.AppProductCode))
    .map((module) => ({
      id: module.AppModuleCode,
      productId: module.AppProductCode,
      name: module.ModuleTitleTR ?? module.ModuleTitleEN ?? module.AppModuleCode,
      description: module.ModuleShortDescriptionTR ?? module.ModuleShortDescriptionEN ?? "",
    }))
    .slice(0, MAX_STAGE2_MODULES);
}

export function recommendSolution(userNeed: string): RecommendationResult {
  const matches = getRecommendationMatches(userNeed);
  if (matches.length === 0) return { summary: unknownSummary, products: [], modules: [] };

  const productsById = new Set<string>();
  const modulesByKey = new Map<string, RecommendationModule>();
  for (const { rule } of matches) {
    rule.products.forEach((id) => productsById.add(id));
    rule.modules.forEach((item) => modulesByKey.set(`${item.productId}:${item.id}`, item));
  }

  return {
    summary: genericSummary,
    products: [...productsById].slice(0, 3).map((id) => ({ id })),
    modules: [...modulesByKey.values()].slice(0, 6),
  };
}
