import Link from "next/link";
import { modules, products, sharedModules } from "@/lib/data";

const liveModuleCount = modules.filter((module) => module.status === "live").length;

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="hero">
        <p className="eyebrow">OnSuite ürün ekosistemi</p>
        <h1>Ürünlerden modüllere, bütün mimari tek bakışta.</h1>
        <p className="hero-copy">
          Ürün portföyünü, canlı ve planlanan modülleri ve ürünler arasında paylaşılan yetenekleri
          build-time verileriyle inceleyin.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/harita">Kataloğu incele</Link>
          <Link className="button button-secondary" href="/mimari">Mimariyi incele</Link>
        </div>
      </section>

      <section className="stat-grid" aria-label="Portföy özeti">
        <article className="stat-card"><strong>{products.length}</strong><span>Ürün</span></article>
        <article className="stat-card"><strong>{modules.length}</strong><span>Toplam modül</span></article>
        <article className="stat-card"><strong>{liveModuleCount}</strong><span>Canlı modül</span></article>
        <article className="stat-card"><strong>{sharedModules.length}</strong><span>Paylaşılan modül</span></article>
      </section>
    </div>
  );
}
