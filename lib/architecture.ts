import type { ProductIconKey } from "@/components/product-icon";
import architectureModules from "@/data/architecture-modules.json";

export type ArchitectureBadge = {
  label: string;
  icon?: ProductIconKey;
};

export type ArchitectureTier = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  badges: ArchitectureBadge[];
  badgeLabel?: string;
  tone: "field" | "core" | "modules" | "output";
  tierIcon?: ProductIconKey;
  processSteps?: string[];
  flowCue?: string;
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

export const architectureTiers: ArchitectureTier[] = [
  {
    number: "01",
    eyebrow: "Verinin kaynağı",
    title: "Saha",
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
    title: "Ürün Modülleri",
    description: "Toplanan veriyi izleme, analiz, optimizasyon, kalite, bakım ve izlenebilirlik süreçlerine dönüştürür.",
    badges: productModules,
    badgeLabel: "OnSuite modülleri",
    tone: "modules",
    tierIcon: "live",
  },
  {
    number: "04",
    eyebrow: "Kurumsal veri akışı",
    title: "Entegrasyon & Çıktı",
    description: "Üretim sonuçlarını kurumsal kaynak planlama, depo ve iş yönetimi sistemleriyle çift yönlü paylaşır.",
    badges: integrationSystems.map((label) => ({ label })),
    badgeLabel: "Entegrasyon",
    tone: "output",
    tierIcon: "integra",
    flowCue: "Gerektiğinde çift yönlü veri alışverişi",
  },
];