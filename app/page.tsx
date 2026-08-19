import Link from "next/link";
import { ArchitectureStateTabs } from "@/components/architecture-state-tabs";
import { architectureTiers } from "@/lib/architecture";
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

      <section id="mimari" className="architecture-home-section" aria-labelledby="home-architecture-title">
        <header className="page-heading architecture-heading">
          <p className="eyebrow">OnSuite üretim mimarisi</p>
          <h2 id="home-architecture-title">Sahadan karara uzanan kesintisiz veri akışı.</h2>
          <p>
            Makine ve protokollerden başlayan üretim verisi, Connect + Core üzerinden ürün
            modüllerine taşınır; kurumsal sistemlere ve operasyonel çıktılara dönüşür.
          </p>
        </header>
        <ArchitectureStateTabs tiers={architectureTiers} />
      </section>
    </div>
  );
}
