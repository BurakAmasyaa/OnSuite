import { modules, products } from "@/lib/data";

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
export type RecommendationCandidates = {
  products: RecommendationCandidateProduct[];
  modules: RecommendationCandidateModule[];
};

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
    products: ["MONITORA", "CONNECTIVITY"],
    modules: [
      { id: "RPTREALTIME", productId: "MONITORA" },
      { id: "TRACEDASHBOARD", productId: "MONITORA" },
      { id: "ALARM", productId: "MONITORA" },
    ],
  },
  {
    terms: ["kalite", "hata", "kusur", "uygunsuz", "tamir"],
    products: ["İZLENEBILIRLIK", "DSF"],
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
const unknownSummary = "İhtiyacınızı biraz daha detaylandırabilirsiniz. Üretimde geliştirmek istediğiniz alanı belirtin.";

const normalizeNeed = (need: string) => need
  .toLocaleLowerCase("tr-TR")
  .replace(/[ıİ]/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

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

export function getRecommendationCandidates(userNeed: string): RecommendationCandidates | null {
  const matches = getRecommendationMatches(userNeed);
  if (matches.length === 0) return null;

  const productIds = new Set<string>();
  const moduleKeys = new Set<string>();
  for (const { rule } of matches) {
    rule.products.forEach((id) => productIds.add(id));
    rule.modules.forEach((item) => moduleKeys.add(`${item.productId}:${item.id}`));
  }

  return {
    products: [...productIds].map((id) => {
      const product = products.find((item) => item.AppProductCode === id);
      return product ? {
        id,
        name: product.ProductTitleTR ?? product.ProductTitleEN ?? id,
        description: product.ProductShortDescriptionTR ?? product.ProductShortDescriptionEN ?? "",
      } : null;
    }).filter((item): item is RecommendationCandidateProduct => item !== null).slice(0, 8),
    modules: [...moduleKeys].map((key) => {
      const [productId, id] = key.split(":");
      const moduleData = modules.find((item) => item.AppProductCode === productId && item.AppModuleCode === id);
      return moduleData ? {
        id,
        productId,
        name: moduleData.ModuleTitleTR ?? moduleData.ModuleTitleEN ?? id,
        description: moduleData.ModuleShortDescriptionTR ?? moduleData.ModuleShortDescriptionEN ?? "",
      } : null;
    }).filter((item): item is RecommendationCandidateModule => item !== null).slice(0, 12),
  };
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
