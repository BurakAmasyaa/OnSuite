import assert from "node:assert/strict";
import { test } from "node:test";
import {
  composeRecommendation,
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

test("modules of products that dropped out are discarded", () => {
  const result = composeRecommendation(
    ["İZLENEBILIRLIK"],
    [{ id: "SOME_ENGAGE_MODULE", productId: "ENGAGE" }],
    "",
  );
  assert.deepEqual(result.modules, []);
});
