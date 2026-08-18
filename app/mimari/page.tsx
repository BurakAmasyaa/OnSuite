import type { Metadata } from "next";
import { ArchitectureStateTabs } from "@/components/architecture-state-tabs";
import {
  ArchitectureTierStack,
  type ArchitectureTier,
} from "@/components/architecture-tier-stack";
import type { ProductIconKey } from "@/components/product-icon";
import architectureModules from "@/data/architecture-modules.json";

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
  "Barkod / RFID",
];

const integrationSystems = ["SAP", "Oracle", "Logo", "Netsis", "ERP", "WMS", "API"];

const productModules = architectureModules.map((module) => ({
  label: module.label,
  icon: module.icon as ProductIconKey,
}));

const architectureTiers: ArchitectureTier[] = [
  {
    number: "01",
    eyebrow: "Verinin kaynağı",
    title: "Saha katmanı",
    description: "Makinelerden, kontrol sistemlerinden ve kimliklendirme teknolojilerinden ham üretim verisini alır.",
    badges: fieldTechnologies.map((label) => ({ label })),
    badgeLabel: "Saha protokolleri",
    tone: "field",
    tierIcon: "connect",
  },
  {
    number: "02",
    eyebrow: "Bağlantı ve ortak servisler",
    title: "Connect + Core",
    description: "Sahadan veriyi toplar, farklı kaynakları normalize eder, merkezi servislerde yönetir ve OnSuite modüllerine dağıtır.",
    badges: [
      { label: "Connect", icon: "connect" },
      { label: "Core", icon: "core" },
    ],
    tone: "core",
    tierIcon: "core",
    processSteps: ["Collect", "Standardize", "Manage", "Distribute"],
  },
  {
    number: "03",
    eyebrow: "Operasyonel yetenekler",
    title: "Ürün modülleri",
    description: "Toplanan veriyi izleme, analiz, optimizasyon, kalite, bakım ve izlenebilirlik süreçlerine dönüştürür.",
    badges: productModules,
    badgeLabel: "OnSuite modülleri",
    tone: "modules",
    tierIcon: "live",
  },
  {
    number: "04",
    eyebrow: "Kurumsal veri akışı",
    title: "Entegrasyon & çıktı",
    description: "Üretim sonuçlarını kurumsal kaynak planlama, depo ve iş yönetimi sistemleriyle çift yönlü paylaşır.",
    badges: integrationSystems.map((label) => ({ label })),
    badgeLabel: "Entegrasyon",
    tone: "output",
    tierIcon: "integra",
    flowCue: "Gerektiğinde çift yönlü veri alışverişi",
  },
];

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

      <ArchitectureTierStack tiers={architectureTiers} />
    </div>
  );
}
