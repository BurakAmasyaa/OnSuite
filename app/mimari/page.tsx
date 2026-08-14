import type { Metadata } from "next";
import { ArchitectureStateTabs } from "@/components/architecture-state-tabs";
import {
  ProductIcon,
  productIconByCode,
  type ProductIconKey,
} from "@/components/product-icon";
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
  .map((product) => ({
    label: product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode,
    icon: productIconByCode[product.AppProductCode],
  }));

type ArchitectureBadge = {
  label: string;
  icon?: ProductIconKey;
};

type ArchitectureLayerProps = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  badges: ArchitectureBadge[];
  badgeLabel?: string;
  tone: "field" | "core" | "modules" | "output";
  tierIcon?: ProductIconKey;
};

function ArchitectureLayerPattern({ tone }: Pick<ArchitectureLayerProps, "tone">) {
  const patternId = `architecture-pattern-${tone}`;

  return (
    <svg
      className="architecture-layer-pattern"
      viewBox="0 0 720 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {tone === "field" ? (
          <pattern id={patternId} width="120" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0 18h34v22h32v24h54M18 0v28h32M92 0v22H72v26h32v32" />
              <circle cx="34" cy="40" r="2.5" />
              <circle cx="66" cy="64" r="2.5" />
              <circle cx="72" cy="48" r="2.5" />
            </g>
          </pattern>
        ) : null}
        {tone === "core" ? (
          <pattern id={patternId} width="160" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 76 54 24l50 28 44-36M54 24l2 62 48-34 34 38" />
              <circle cx="12" cy="76" r="3" />
              <circle cx="54" cy="24" r="3" />
              <circle cx="56" cy="86" r="3" />
              <circle cx="104" cy="52" r="3" />
              <circle cx="148" cy="16" r="3" />
              <circle cx="138" cy="90" r="3" />
            </g>
          </pattern>
        ) : null}
        {tone === "modules" ? (
          <pattern id={patternId} width="180" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M14 12v72h152M24 68l30-22 28 11 31-34 42 20" />
              <path d="M34 76V62M69 76V55M104 76V38M139 76V49" strokeWidth="5" />
              <circle cx="54" cy="46" r="2.5" />
              <circle cx="82" cy="57" r="2.5" />
              <circle cx="113" cy="23" r="2.5" />
            </g>
          </pattern>
        ) : null}
        {tone === "output" ? (
          <pattern id={patternId} width="160" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2">
              <path d="M4 20h116m-8-6 8 6-8 6M36 60h116m-8-6 8 6-8 6M18 70 70 18m-1 10 1-10-10 1" />
            </g>
          </pattern>
        ) : null}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function ArchitectureLayer({ number, eyebrow, title, description, badges, badgeLabel, tone, tierIcon }: ArchitectureLayerProps) {
  return (
    <article className={`architecture-layer architecture-layer-${tone}`}>
      <ArchitectureLayerPattern tone={tone} />
      <div className="architecture-layer-copy">
        {tierIcon ? (
          <span className="architecture-tier-icon">
            <ProductIcon icon={tierIcon} />
          </span>
        ) : (
          <span className="architecture-number">{number}</span>
        )}
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
          <span>{description}</span>
        </div>
      </div>
      <div className="architecture-badge-group">
        {badgeLabel ? <p className="architecture-badge-label">{badgeLabel}</p> : null}
        <div className="architecture-badges" aria-label={`${title} bileşenleri`}>
          {badges.map((badge) => (
            <span key={badge.label}>
              {badge.icon ? <ProductIcon icon={badge.icon} /> : null}
              {badge.label}
            </span>
          ))}
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
          badges={fieldTechnologies.map((label) => ({ label }))}
          badgeLabel="Saha protokolleri"
          tone="field"
          tierIcon="connect"
        />
        <FlowArrow />
        <ArchitectureLayer
          number="02"
          eyebrow="Bağlantı ve ortak servisler"
          title="Connect + Core"
          description="Saha verisini güvenli biçimde toplar, normalize eder ve tüm OnSuite ürünleri için ortak bir omurga oluşturur."
          badges={[
            { label: "Connect", icon: "connect" },
            { label: "Core", icon: "core" },
          ]}
          tone="core"
          tierIcon="core"
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
          badges={integrationSystems.map((label) => ({ label }))}
          badgeLabel="Entegrasyon"
          tone="output"
          tierIcon="integra"
        />
      </section>
    </div>
  );
}
