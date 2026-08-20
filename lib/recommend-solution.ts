import { getOfficialProductDescription, modules, products } from "@/lib/data";

export type RecommendationProduct = { id: string };
export type RecommendationModule = { id: string; productId: string };
/** One layer of the recommended stack: which product, and the job it does
 * there. `tier` follows the Mimari layers (see lib/architecture.ts). */
export type RecommendationRole = {
  productId: string;
  name: string;
  tier: "connect" | "core" | "capability";
  role: string;
};
export type RecommendationResult = {
  summary: string;
  products: RecommendationProduct[];
  modules: RecommendationModule[];
  /** Products that solve a separate need and are shown apart from the main
   * stack rather than mixed into it (currently Engage — see PLATFORM_RULES). */
  standaloneProducts: RecommendationProduct[];
  /** Per-product role in the selected stack, so the answer says what each
   * layer actually does rather than just naming it. Wording comes from the
   * canonical descriptions — never model-generated prose. */
  solutionRoles: RecommendationRole[];
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
  /** Terms that name a product's specific domain rather than a generic
   * capability. One of these outweighs any number of generic matches, so
   * "tütün makinesi OPC UA" resolves to TMC instead of losing on term count
   * to the broader machine-data rule. */
  distinctiveTerms?: string[];
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
    // "yönetim" alone matched almost any sentence ("eğitim yönetimi",
    // "yetkilendirme ve platform yönetimi") and locked those queries onto
    // reporting. Keep the terms specific to reporting and insight.
    terms: ["raporlama", "rapor", "görünürlük", "içgörü", "analiz", "dashboard", "gösterge"],
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
    terms: ["tütün", "tobacco", "tmc"],
    distinctiveTerms: ["tütün", "tobacco", "tmc"],
    products: ["OPCTMC"],
    modules: [],
  },
  {
    terms: ["cnc", "tezgah", "makine verisi", "makineden veri", "veri toplama", "opc ua"],
    products: ["CNC"],
    modules: [],
  },
  {
    terms: ["form", "kontrol formu", "checklist", "saha formu"],
    products: ["DSF"],
    modules: [],
  },
  {
    terms: ["erp", "sap", "entegrasyon", "mes", "wms", "veri alışverişi"],
    products: ["ENTEGRASYON"],
    modules: [],
  },
  {
    terms: ["eğitim", "sertifika", "yetkinlik", "training", "kurs"],
    products: ["LMS"],
    modules: [],
  },
  {
    terms: ["onay", "iş akışı", "approve", "talep"],
    products: ["APPROVE"],
    modules: [],
  },
  {
    terms: ["acil durum", "kriz", "çalışan güvenliği", "tahliye"],
    products: ["ENGAGE"],
    modules: [],
  },
  {
    terms: ["duyuru", "bilgilendirme", "ekran", "anons"],
    products: ["INFORM"],
    modules: [],
  },
  {
    terms: ["yetkilendirme", "kullanıcı yönetimi", "platform yönetimi", "rol"],
    products: ["CORE"],
    modules: [],
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

const CORE_PRODUCT_ID = "CORE";
const CONNECT_PRODUCT_ID = "CONNECTIVITY";
const ENGAGE_PRODUCT_ID = "ENGAGE";

/**
 * Products whose data source is the shop floor. Connect is the collection
 * layer beneath them (architecture tier 02), so selecting any of these
 * implies Connect; a need met purely by Core-level products (Forms, Integra)
 * does not.
 */
const MACHINE_DATA_PRODUCT_IDS = new Set(["CNC", "OPCTMC", "MONITORA", "OEE"]);

/**
 * Platform composition rules, applied deterministically after selection
 * rather than left to the model: which products sit on the shared platform
 * is a fixed property of the architecture (see lib/architecture.ts tier 02),
 * not a judgement call that should vary between runs.
 */
function applyPlatformRules(productIds: string[]): { products: string[]; standalone: string[] } {
  const selected = productIds.filter((id) => id !== ENGAGE_PRODUCT_ID);
  const standalone = productIds.filter((id) => id === ENGAGE_PRODUCT_ID);

  if (selected.length === 0) return { products: [], standalone };

  const withPlatform = new Set(selected);
  if (selected.some((id) => MACHINE_DATA_PRODUCT_IDS.has(id))) {
    withPlatform.add(CONNECT_PRODUCT_ID);
  }
  withPlatform.add(CORE_PRODUCT_ID);

  // Ordered by architecture tier so the stack always reads Connect → Core →
  // capabilities, matching how the Mimari section presents the same layers.
  const tierOrder = (id: string) => (id === CONNECT_PRODUCT_ID ? 0 : id === CORE_PRODUCT_ID ? 1 : 2);
  const products = [...withPlatform].sort((left, right) => tierOrder(left) - tierOrder(right));

  return { products, standalone };
}

function productDisplayName(productId: string): string {
  const product = products.find((item) => item.AppProductCode === productId);
  return product?.ProductTitleTR ?? product?.ProductTitleEN ?? productId;
}

/**
 * What each product does in a recommended stack, phrased in third person.
 * Written out rather than derived from the official descriptions by string
 * surgery: splitting and re-conjugating that Turkish copy produced mangled
 * fragments ("oEE", "farklı makine", "toplayır"). Each line here restates its
 * product's verified description from data/product-official-descriptions.json
 * without adding capabilities.
 */
const PRODUCT_ROLES: Record<string, string> = {
  [CONNECT_PRODUCT_ID]: "farklı makine ve sistemlerden veriyi toplar, bağlantıları merkezi ve sürdürülebilir bir yapıda yönetir",
  [CORE_PRODUCT_ID]: "tüm modüller için ortak altyapıyı kurar, yetki ve platform servislerini merkezi olarak yönetir",
  CNC: "tezgah verisini dijital ortama taşır ve veri akışlarını standartlaştırır",
  OPCTMC: "OPC UA TMC protokolü üzerinden tütün makinelerinden veri toplar ve süreçleri izler",
  MONITORA: "üretimi gerçek zamanlı izler, kritik olayları anında görünür kılar",
  OEE: "OEE ve performans kayıplarını analiz ederek verimlilik iyileştirmelerini destekler",
  "İZLENEBILIRLIK": "ürün, lot ve seri bazlı izlenebilirliği uçtan uca yönetir",
  DSF: "saha formlarını ve kontrol akışlarını dijitalleştirir",
  INTELLIGENCE: "üretim verisini sorgulanabilir analizlere dönüştürür",
  CARBONIQ: "karbon ayak izi ve sürdürülebilirlik hedeflerini veriyle yönetir",
  ENTEGRASYON: "ERP, MES ve diğer kurumsal sistemlerle veri alışverişini yönetir",
  LMS: "eğitim ve yetkinlik süreçlerini yönetir",
  APPROVE: "onay ve iş akışı süreçlerini yürütür",
  ENGAGE: "acil durumlarda çalışan güvenliğini çift kanallı olarak doğrular",
  INFORM: "üretim bilgisini duyuru ve bilgilendirme ekranlarına taşır",
};

/** What a product does in a stack, for callers that show one product on its
 * own (the standalone Engage card) rather than a whole layered solution. */
export function getProductRole(productId: string): string {
  return PRODUCT_ROLES[productId] ?? "";
}

/**
 * Describes what each selected layer does, using only canonical copy.
 * Deliberately derived rather than model-written: the AI prompts forbid
 * inventing OnSuite capabilities, and free-form generated prose is exactly
 * where that guarantee would break down.
 */
function buildSolutionRoles(productIds: string[]): RecommendationRole[] {
  const capabilities = productIds.filter((id) => id !== CORE_PRODUCT_ID && id !== CONNECT_PRODUCT_ID);
  if (capabilities.length === 0) return [];

  return productIds.map((productId): RecommendationRole => ({
    productId,
    name: productDisplayName(productId),
    tier: productId === CONNECT_PRODUCT_ID ? "connect" : productId === CORE_PRODUCT_ID ? "core" : "capability",
    role: PRODUCT_ROLES[productId] ?? "",
  })).filter((entry) => entry.role !== "");
}

export function emptyRecommendation(summary: string): RecommendationResult {
  return { summary, products: [], modules: [], standaloneProducts: [], solutionRoles: [] };
}

/** Applies the platform rules and narrative to a raw product selection,
 * shared by the local fast path and the AI-backed broad path. */
export function composeRecommendation(
  productIds: string[],
  modules: RecommendationModule[],
  summary: string,
): RecommendationResult {
  const { products: composed, standalone } = applyPlatformRules(productIds);
  const composedSet = new Set(composed);

  return {
    summary,
    products: composed.map((id) => ({ id })),
    standaloneProducts: standalone.map((id) => ({ id })),
    // Platform products are added for context, so keep only modules whose
    // product actually survived composition.
    modules: modules.filter((module) => composedSet.has(module.productId)),
    solutionRoles: buildSolutionRoles(composed),
  };
}

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

/**
 * Matches on a word-prefix boundary rather than a bare substring, so "rol"
 * no longer fires inside "kontrol" and "form" no longer fires inside
 * "performans". Terms ending in a partial stem (e.g. "verimlil") still match
 * their inflections because only the start of the word is anchored.
 */
function termMatches(normalizedNeed: string, term: string): boolean {
  const normalizedTerm = normalizeNeed(term);
  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}`).test(normalizedNeed);
}

function getRecommendationMatches(userNeed: string) {
  const normalizedNeed = normalizeNeed(userNeed.trim());
  if (!normalizedNeed) return [];

  const scored = recommendationRules
    .map((rule, index) => {
      const score = rule.terms.reduce((total, term) => total + (termMatches(normalizedNeed, term) ? 1 : 0), 0);
      const isDistinctive = rule.distinctiveTerms?.some((term) => termMatches(normalizedNeed, term)) ?? false;
      return { rule, index, score, isDistinctive };
    })
    .filter((match) => match.score > 0)
    .sort((left, right) =>
      Number(right.isDistinctive) - Number(left.isDistinctive) ||
      right.score - left.score ||
      left.index - right.index);

  // A domain-specific hit settles the answer on its own; drop the generic
  // rules that merely shared a keyword with it.
  const distinctive = scored.filter((match) => match.isDistinctive);
  if (distinctive.length > 0) return distinctive;

  if (scored.length === 0) return scored;

  // Merging every rule that matched at all let a single incidental keyword
  // drag an unrelated product into the answer. Keep only rules matching the
  // top score, so a decisive match wins instead of being diluted.
  const topScore = scored[0].score;
  return scored.filter((match) => match.score === topScore);
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
 * selected) product IDs, from the canonical Excel-derived module data.
 * Interleaved by product rather than concatenated, because a flat slice let
 * a module-heavy product (Trace has 24) crowd a later product out of the
 * candidate list entirely. */
export function getStage2ModuleCandidates(productIds: string[]): RecommendationCandidateModule[] {
  const byProduct = productIds.map((productId) => modules
    .filter((module) => module.AppProductCode === productId)
    .map((module) => ({
      id: module.AppModuleCode,
      productId: module.AppProductCode,
      name: module.ModuleTitleTR ?? module.ModuleTitleEN ?? module.AppModuleCode,
      description: module.ModuleShortDescriptionTR ?? module.ModuleShortDescriptionEN ?? "",
    })));

  const interleaved: RecommendationCandidateModule[] = [];
  const longest = Math.max(0, ...byProduct.map((list) => list.length));
  for (let round = 0; round < longest; round += 1) {
    for (const list of byProduct) {
      if (round < list.length) interleaved.push(list[round]);
    }
  }

  return interleaved.slice(0, MAX_STAGE2_MODULES);
}

export function recommendSolution(userNeed: string): RecommendationResult {
  const matches = getRecommendationMatches(userNeed);
  if (matches.length === 0) return emptyRecommendation(unknownSummary);

  const productsById = new Set<string>();
  const modulesByKey = new Map<string, RecommendationModule>();
  for (const { rule } of matches) {
    rule.products.forEach((id) => productsById.add(id));
    rule.modules.forEach((item) => modulesByKey.set(`${item.productId}:${item.id}`, item));
  }

  // Slice before composing so the cap applies to matched capabilities; the
  // platform products the rules add back are context, not competing picks.
  return composeRecommendation(
    [...productsById].slice(0, 3),
    [...modulesByKey.values()].slice(0, 6),
    genericSummary,
  );
}
