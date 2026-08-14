import type { Metadata } from "next";
import { ProductCatalog } from "@/components/product-catalog";
import { modules, products, sharedModules } from "@/lib/data";

export const metadata: Metadata = { title: "Ürün-Modül Kataloğu" };

const moduleCounts = modules.reduce<Record<string, number>>((counts, module) => {
  counts[module.AppProductCode] = (counts[module.AppProductCode] ?? 0) + 1;
  return counts;
}, {});

const mapProducts = products.map((product) => ({
  code: product.AppProductCode,
  title: product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode,
  moduleCount: moduleCounts[product.AppProductCode] ?? 0,
}));

const productTitles = new Map(
  products.map((product) => [
    product.AppProductCode,
    product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode,
  ]),
);

const catalogSharedModules = sharedModules.map((module) => ({
  code: module.moduleCode,
  title: module.moduleTitleTR ?? module.moduleTitleEN ?? module.moduleCode,
  products: module.products.map((productCode) => ({
    code: productCode,
    title: productTitles.get(productCode) ?? productCode,
  })),
}));

export default function ProductMapPage() {
  return (
    <div className="page-shell map-page-shell">
      <header className="page-heading map-heading">
        <p className="eyebrow">Ürün-Modül Kataloğu</p>
        <h1>OnSuite ürün ailesi, düzenli ve karşılaştırılabilir.</h1>
        <p>
          Tüm ürünleri ve modül kapsamlarını tek bir sabit katalog görünümünde inceleyin.
        </p>
      </header>
      <ProductCatalog products={mapProducts} sharedModules={catalogSharedModules} />
    </div>
  );
}
