import type { Metadata } from "next";
import { ProductModuleMap } from "@/components/product-module-map";
import { modules, products } from "@/lib/data";

export const metadata: Metadata = { title: "Ürün-Modül Haritası" };

const moduleCounts = modules.reduce<Record<string, number>>((counts, module) => {
  counts[module.AppProductCode] = (counts[module.AppProductCode] ?? 0) + 1;
  return counts;
}, {});

const mapProducts = products.map((product) => ({
  code: product.AppProductCode,
  name: product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode,
  moduleCount: moduleCounts[product.AppProductCode] ?? 0,
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
      <ProductModuleMap products={mapProducts} />
    </div>
  );
}
