import type { Metadata } from "next";
import { modules, products, sharedModules } from "@/lib/data";

export const metadata: Metadata = { title: "Ürün-Modül Haritası" };

export default function ProductModuleMapPage() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">Ürün-Modül Haritası</p>
        <h1>{products.length} ürün, {modules.length} modül, tek veri modeli.</h1>
        <p>
          Bu sayfa React Flow ve Dagre tabanlı etkileşimli harita için hazırdır. Veri kaynakları
          build aşamasında tip güvenli olarak içe aktarılır.
        </p>
      </header>
      <section className="content-grid">
        {sharedModules.slice(0, 9).map((module) => (
          <article className="content-card" key={module.moduleCode}>
            <h2>{module.moduleTitleTR ?? module.moduleCode}</h2>
            <p>{module.moduleTitleEN ?? "İngilizce başlık bulunmuyor"}</p>
            <div className="pill-row">
              {module.products.map((product) => <span className="pill" key={product}>{product}</span>)}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
