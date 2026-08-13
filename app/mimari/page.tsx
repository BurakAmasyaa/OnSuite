import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mimari" };

const layers = [
  ["Veri", "products.json, modules.json ve shared-modules.json derleme zamanında okunur."],
  ["Model", "lib/data.ts tipleri, koleksiyonları ve sorgu yardımcılarını tek noktada sunar."],
  ["Sunum", "App Router sayfaları veriyi sunucu bileşenlerinde işler; istemciye yalnızca gereken çıktı gider."],
];

export default function ArchitecturePage() {
  return (
    <div className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">Mimari</p>
        <h1>Basit, statik ve büyümeye hazır.</h1>
        <p>Veri katmanı, rota yapısı ve görselleştirme bağımlılıkları birbirinden ayrılmıştır.</p>
      </header>
      <section className="content-grid">
        {layers.map(([title, description], index) => (
          <article className="content-card" key={title}>
            <span className="pill">0{index + 1}</span>
            <h2 style={{ marginTop: 18 }}>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
