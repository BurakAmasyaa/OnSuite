import type { Metadata } from "next";
import type { CSSProperties } from "react";
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

const sceneProtocols = [
  { name: "Siemens S7", before: [8, 14], after: [8, 12] },
  { name: "Beckhoff", before: [38, 8], after: [35, 10] },
  { name: "Allen-Bradley", before: [72, 15], after: [72, 12] },
  { name: "Modbus", before: [82, 42], after: [84, 45] },
  { name: "OPC DA", before: [66, 70], after: [73, 76] },
  { name: "OPC UA", before: [40, 80], after: [48, 84] },
  { name: "Mitsubishi", before: [13, 70], after: [18, 76] },
  { name: "MQTT", before: [4, 43], after: [4, 45] },
  { name: "TCP/IP", before: [45, 40], after: [48, 9] },
] as const;

const fragmentedLines = [
  [14, 20, 69, 34, 0],
  [41, 15, 43, 57, -0.6],
  [77, 22, 47, 132, -1.1],
  [11, 50, 61, -21, -0.4],
  [19, 76, 58, -45, -0.9],
  [47, 46, 39, 33, -1.2],
  [45, 84, 42, -47, -0.2],
] as const;

const connectedLines = [
  [50, 50, 45, -159, 0],
  [50, 50, 28, -132, -0.3],
  [50, 50, 37, -31, -0.6],
  [50, 50, 34, -4, -0.9],
  [50, 50, 35, 34, -1.2],
  [50, 50, 29, 87, -1.5],
  [50, 50, 38, 143, -1.8],
  [50, 50, 43, 177, -2.1],
  [50, 50, 34, -91, -2.4],
] as const;

const productModules = products
  .filter((product) => product.AppProductCode !== "CORE" && product.AppProductCode !== "CONNECTIVITY")
  .map((product) => product.ProductTitleTR ?? product.ProductTitleEN ?? product.AppProductCode);

type ArchitectureLayerProps = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  badges: string[];
  tone: "field" | "core" | "modules" | "output";
};

function ArchitectureLayer({ number, eyebrow, title, description, badges, tone }: ArchitectureLayerProps) {
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
      <div className="architecture-badges" aria-label={`${title} bileşenleri`}>
        {badges.map((badge) => <span key={badge}>{badge}</span>)}
      </div>
    </article>
  );
}

function FlowArrow() {
  return <div className="architecture-arrow" aria-hidden="true"><span>↓</span></div>;
}

function ProtocolBadge({ name, position }: { name: string; position: readonly [number, number] }) {
  return (
    <span
      className="protocol-scene-badge"
      style={{ "--badge-x": `${position[0]}%`, "--badge-y": `${position[1]}%` } as CSSProperties}
    >
      {name}
    </span>
  );
}

function ProtocolLine({ line }: { line: readonly [number, number, number, number, number] }) {
  return (
    <span
      className="protocol-scene-line"
      style={{
        "--line-x": `${line[0]}%`,
        "--line-y": `${line[1]}%`,
        "--line-length": `${line[2]}%`,
        "--line-angle": `${line[3]}deg`,
        "--line-delay": `${line[4]}s`,
      } as CSSProperties}
    />
  );
}

function ProtocolTransformation() {
  return (
    <section className="protocol-transformation" aria-labelledby="protocol-transformation-title">
      <div className="protocol-transformation-heading">
        <p className="eyebrow">Bağlantı karmaşasından ortak dile</p>
        <h2 id="protocol-transformation-title">
          9 farklı protokol, 9 ayrı entegrasyon — ya da tek katman.
        </h2>
      </div>

      <div className="protocol-scene" aria-label="Saha protokollerinin Connect katmanında birleşmesi">
        <div className="protocol-scene-state protocol-scene-before" aria-hidden="true">
          <span className="protocol-scene-state-label">Dağınık yapı</span>
          {fragmentedLines.map((line, index) => <ProtocolLine key={index} line={line} />)}
          {sceneProtocols.map((protocol) => (
            <ProtocolBadge key={protocol.name} name={protocol.name} position={protocol.before} />
          ))}
          <span className="protocol-warning protocol-warning-one">!</span>
          <span className="protocol-warning protocol-warning-two">!</span>
        </div>

        <div className="protocol-scene-state protocol-scene-after">
          <span className="protocol-scene-state-label">OnSuite ile</span>
          {connectedLines.map((line, index) => <ProtocolLine key={index} line={line} />)}
          {sceneProtocols.map((protocol) => (
            <ProtocolBadge key={protocol.name} name={protocol.name} position={protocol.after} />
          ))}
          <div className="protocol-connect-hub">
            <span>OnSuite</span>
            <strong>Connect</strong>
          </div>
        </div>
      </div>
    </section>
  );
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

      <ProtocolTransformation />

      <section className="architecture-stack" aria-label="OnSuite üretim mimarisi katmanları">
        <ArchitectureLayer
          number="01"
          eyebrow="Verinin kaynağı"
          title="Saha katmanı"
          description="Makineler, kontrol sistemleri, endüstriyel protokoller ve kimliklendirme teknolojileri."
          badges={fieldTechnologies}
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
          tone="output"
        />
      </section>
    </div>
  );
}
