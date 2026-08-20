import assert from "node:assert/strict";
import { test } from "node:test";
import { products } from "./data";
import {
  composeRecommendation,
  getProductRole,
  getStage2ModuleCandidates,
  recommendSolution,
} from "./recommend-solution";

/** Product IDs the need should resolve to, whether as a main pick or a
 * standalone one. */
function selectedIds(need: string): string[] {
  const result = recommendSolution(need);
  return [...result.products, ...result.standaloneProducts].map((item) => item.id);
}

test("routes needs to the product that owns that domain", () => {
  const expectations: [string, string][] = [
    ["eğitim yönetimi ve sertifika takibi", "LMS"],
    ["onay süreçleri ve iş akışı", "APPROVE"],
    ["duyuru ve bilgilendirme ekranları", "INFORM"],
    ["saha kontrol formları dijitalleştirme", "DSF"],
    ["ERP entegrasyonu", "ENTEGRASYON"],
    ["acil durum çalışan güvenliği", "ENGAGE"],
    ["kullanıcı yetkilendirme ve platform yönetimi", "CORE"],
    ["CNC veri toplama ve ürün takibi", "CNC"],
    ["anlık üretim takibi", "MONITORA"],
    ["kalite", "İZLENEBILIRLIK"],
    ["verimlilik", "OEE"],
  ];

  for (const [need, expected] of expectations) {
    assert.ok(selectedIds(need).includes(expected), `"${need}" should select ${expected}`);
  }
});

test("a domain-specific term outranks a generic one sharing keywords", () => {
  // "veri toplama" also matches the broader machine-data rule, which used to
  // win on term count and answer CNC.
  assert.ok(selectedIds("tütün makinesi OPC UA veri toplama").includes("OPCTMC"));
  assert.ok(!selectedIds("tütün makinesi OPC UA veri toplama").includes("CNC"));
});

test("terms match on word boundaries, not bare substrings", () => {
  // "form" must not fire inside "performans", nor "rol" inside "kontrol".
  assert.ok(!selectedIds("performans analizi").includes("DSF"));
  assert.ok(!selectedIds("kontrol listesi").includes("CORE"));
});

test("Core joins every stack and Connect only follows machine data", () => {
  const machine = composeRecommendation(["CNC"], [], "");
  assert.deepEqual(machine.products.map((p) => p.id), ["CONNECTIVITY", "CORE", "CNC"]);

  const officeOnly = composeRecommendation(["DSF"], [], "");
  assert.deepEqual(officeOnly.products.map((p) => p.id), ["CORE", "DSF"]);
});

test("Engage is split out as a standalone solution", () => {
  const mixed = composeRecommendation(["ENGAGE", "İZLENEBILIRLIK"], [], "");
  assert.deepEqual(mixed.standaloneProducts.map((p) => p.id), ["ENGAGE"]);
  assert.ok(!mixed.products.some((p) => p.id === "ENGAGE"));

  const alone = composeRecommendation(["ENGAGE"], [], "");
  assert.deepEqual(alone.products, []);
  assert.deepEqual(alone.standaloneProducts.map((p) => p.id), ["ENGAGE"]);
});

test("module candidates keep every selected product represented", () => {
  // Trace alone has 24 modules; a flat slice used to crowd out later products.
  const candidates = getStage2ModuleCandidates(["İZLENEBILIRLIK", "CNC", "DSF"]);
  for (const productId of ["İZLENEBILIRLIK", "CNC", "DSF"]) {
    assert.ok(
      candidates.some((module) => module.productId === productId),
      `${productId} should appear among the candidates`,
    );
  }
});

test("every layer explains its own job", () => {
  const roles = composeRecommendation(["CNC", "İZLENEBILIRLIK"], [], "").solutionRoles;

  assert.deepEqual(roles.map((entry) => entry.productId), ["CONNECTIVITY", "CORE", "CNC", "İZLENEBILIRLIK"]);
  assert.deepEqual(roles.map((entry) => entry.tier), ["connect", "core", "capability", "capability"]);

  // Each role has to say something specific — the previous templated summary
  // read almost identically for every need.
  const descriptions = roles.map((entry) => entry.role);
  assert.equal(new Set(descriptions).size, descriptions.length);
  for (const description of descriptions) {
    assert.ok(description.length > 20, `role text too thin: "${description}"`);
  }
});

test("a stack of platform products alone has no roles to explain", () => {
  assert.deepEqual(composeRecommendation(["CORE"], [], "").solutionRoles, []);
});

test("every catalog product can describe its role", () => {
  // A product with no role text is silently dropped from the explanation, so
  // catch a newly added one here rather than in the UI. Pairing each product
  // with a capability keeps the platform-only case (which has nothing to
  // explain) out of the way.
  for (const product of products) {
    const productId = product.AppProductCode;
    // Core and Connect only appear alongside a capability; Engage is split
    // out as a standalone product and carries its role there.
    if (productId === "CORE" || productId === "CONNECTIVITY" || productId === "ENGAGE") continue;

    const roles = composeRecommendation([productId], [], "").solutionRoles;
    assert.ok(
      roles.some((entry) => entry.productId === productId),
      `${productId} has no role text`,
    );
  }

  assert.ok(getProductRole("ENGAGE").length > 20, "Engage has no role text");

  // The platform layers describe themselves too, once a capability is present.
  const withCapability = composeRecommendation(["CNC"], [], "").solutionRoles;
  for (const platformId of ["CONNECTIVITY", "CORE"]) {
    assert.ok(withCapability.some((entry) => entry.productId === platformId));
  }
});

test("modules of products that dropped out are discarded", () => {
  const result = composeRecommendation(
    ["İZLENEBILIRLIK"],
    [{ id: "SOME_ENGAGE_MODULE", productId: "ENGAGE" }],
    "",
  );
  assert.deepEqual(result.modules, []);
});
