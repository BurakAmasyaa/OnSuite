import type { Metadata } from "next";
import { ProductModuleMap } from "@/components/product-module-map";
import { modules, products, sharedModules } from "@/lib/data";

export const metadata: Metadata = { title: "Ürün-Modül Haritası" };

const moduleCounts = modules.reduce<Record<string, number>>((counts, module) => {
  counts[module.AppProductCode] = (counts[module.AppProductCode] ?? 0) + 1;
  return counts;
}, {});

const sharedModuleCounts = sharedModules.reduce<Record<string, number>>((counts, module) => {
  module.products.forEach((productCode) => {
    counts[productCode] = (counts[productCode] ?? 0) + 1;
  });
  return counts;
}, {});

const mapProducts = products.map((product) => ({
  code: product.AppProductCode,
  name: product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode,
  moduleCount: moduleCounts[product.AppProductCode] ?? 0,
  sharedModuleCount: sharedModuleCounts[product.AppProductCode] ?? 0,
}));

const sharedProductsByModuleCode = new Map(
  sharedModules.map((module) => [module.moduleCode, module.products]),
);

const mapModules = modules.map((module) => ({
  productCode: module.AppProductCode,
  code: module.AppModuleCode,
  name: module.ModuleTitleTR ?? module.ModuleTitleEN ?? module.AppModuleCode,
  completePercentage: module.CompletePercentage,
  status: module.status === "planned" ? "planned" as const : "live" as const,
  draft: module.Draft === 1,
  shortDescription: module.ModuleShortDescriptionTR,
  description: module.DescriptionTR,
  features: module.features
    .map((feature) => feature.MenuNameTR ?? feature.MenuNameEN)
    .filter((feature): feature is string => feature !== null),
  sharedProducts: sharedProductsByModuleCode.get(module.AppModuleCode) ?? [],
}));

const mapSharedModules = sharedModules.map((module) => ({
  code: module.moduleCode,
  name: module.moduleTitleTR ?? module.moduleTitleEN ?? module.moduleCode,
  products: module.products,
}));

export default function ProductModuleMapPage() {
  return (
    <div className="page-shell map-page-shell">
      <header className="page-heading map-heading">
        <p className="eyebrow">Ürün-Modül Haritası</p>
        <h1>Ürün ailesinin tamamı, tek merkez etrafında.</h1>
        <p>
          Haritayı sürükleyerek gezebilir, yakınlaştırıp uzaklaştırabilirsiniz. Yerleşim Dagre
          tarafından otomatik hesaplanır.
        </p>
      </header>
      <ProductModuleMap products={mapProducts} modules={mapModules} sharedModules={mapSharedModules} />
    </div>
  );
}
