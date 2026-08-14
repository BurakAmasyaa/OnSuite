import type { Metadata } from "next";
import { ArchitectureStateTabs } from "@/components/architecture-state-tabs";
import { products } from "@/lib/data";

export const metadata: Metadata = {
  title: "Üretim Mimarisi",
  description: "OnSuite'in sahadan kurumsal sistemlere uzanan dört katmanlı üretim mimarisi.",
};

const fieldTechnologies = [
  "Siemens S7",
  "Beckhoff",
  "Allen-Bradley",
  "Modbus",
  "OPC DA/UA",
  "Mitsubishi",
  "MQTT",
  "TCP/IP",
  "Barcode/RFID",
];

const integrationSystems = ["SAP", "Oracle", "Logo", "Netsis", "WMS"];

const productModules = products
  .filter((product) => product.AppProductCode !== "CORE" && product.AppProductCode !== "CONNECTIVITY")
  .map((product) => product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode);

type ArchitectureLayerProps = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  badges: string[];
  badgeLabel?: string;
  tone: "field" | "core" | "modules" | "output";
};

function ArchitectureLayer({ number, eyebrow, title, description, badges, badgeLabel, tone }: ArchitectureLayerProps) {
  return (
    <article className={`architecture-layer architecture-layer-${tone}`}>
      <div className="architecture-layer-copy">
        <span className="architecture-number">{number}</span>
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </div>
      <div className="architecture-badge-group">
        {badgeLabel ? <p className="architecture-badge-label">{badgeLabel}</p> : null}
        <div className="architecture-badges" aria-label={`${title} bileşenleri`}>
          {badges.map((badge) => <span key={badge}>{badge}</span>)}
        </div>
      </div>
    </article>
  );
}

function FlowArrow() {
  return <div className="architecture-arrow" aria-hidden="true"><span>↓</span></div>;
}

export default function ArchitecturePage() {
  return (
    <div className="page-shell architecture-page">
      <header className="page-heading architecture-heading">
        <p className="eyebrow">OnSuite üretim mimarisi</p>
        <h1>Sahadan karara uzanan kesintisiz veri akışı.</h1>
        <p>
          Makine ve protokollerden başlayan üretim verisi, Connect + Core üzerinden ürün
          modüllerine taşınır; kurumsal sistemlere ve operasyonel çıktılara dönüşür.
        </p>
      </header>

      <ArchitectureStateTabs />

      <section className="architecture-stack" aria-label="OnSuite üretim mimarisi katmanları">
        <ArchitectureLayer
          number="01"
          eyebrow="Verinin kaynağı"
          title="Saha katmanı"
          description="Makineler, kontrol sistemleri, endüstriyel protokoller ve kimliklendirme teknolojileri."
          badges={fieldTechnologies}
          badgeLabel="Saha protokolleri"
          tone="field"
        />
        <FlowArrow />
        <ArchitectureLayer
          number="02"
          eyebrow="Bağlantı ve ortak servisler"
          title="Connect + Core"
          description="Saha verisini güvenli biçimde toplar, normalize eder ve tüm OnSuite ürünleri için ortak bir omurga oluşturur."
          badges={["Connect", "Core"]}
          tone="core"
        />
        <FlowArrow />
        <ArchitectureLayer
          number="03"
          eyebrow="Operasyonel yetenekler"
          title="Ürün modülleri"
          description="Toplanan veriyi izleme, analiz, optimizasyon, kalite, bakım ve izlenebilirlik süreçlerine dönüştürür."
          badges={productModules}
          tone="modules"
        />
        <FlowArrow />
        <ArchitectureLayer
          number="04"
          eyebrow="Kurumsal veri akışı"
          title="Entegrasyon & çıktı"
          description="Üretim sonuçlarını kurumsal kaynak planlama, depo ve iş yönetimi sistemleriyle çift yönlü paylaşır."
          badges={integrationSystems}
          badgeLabel="Entegrasyon"
          tone="output"
        />
      </section>
    </div>
  );
}
