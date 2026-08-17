import type { Metadata } from "next";
import { ArchitectureStateTabs } from "@/components/architecture-state-tabs";
import {
  ArchitectureTierStack,
  type ArchitectureTier,
} from "@/components/architecture-tier-stack";
import { productIconByCode } from "@/components/product-icon";
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

const architectureTiers: ArchitectureTier[] = [
  {
    number: "01",
    eyebrow: "Verinin kaynağı",
    title: "Saha katmanı",
    description: "Makineler, kontrol sistemleri, endüstriyel protokoller ve kimliklendirme teknolojileri.",
    badges: fieldTechnologies.map((label) => ({ label })),
    badgeLabel: "Saha protokolleri",
    tone: "field",
    tierIcon: "connect",
  },
  {
    number: "02",
    eyebrow: "Bağlantı ve ortak servisler",
    title: "Connect + Core",
    description: "Saha verisini güvenli biçimde toplar, normalize eder ve tüm OnSuite ürünleri için ortak bir omurga oluşturur.",
    badges: [
      { label: "Connect", icon: "connect" },
      { label: "Core", icon: "core" },
    ],
    tone: "core",
    tierIcon: "core",
  },
  {
    number: "03",
    eyebrow: "Operasyonel yetenekler",
    title: "Ürün modülleri",
    description: "Toplanan veriyi izleme, analiz, optimizasyon, kalite, bakım ve izlenebilirlik süreçlerine dönüştürür.",
    badges: productModules,
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
