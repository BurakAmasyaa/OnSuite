import type { CSSProperties } from "react";
import { ProductIcon, productIconByCode, type ProductIconKey } from "@/components/product-icon";
import publicProducts from "@/data/public-products.json";

type ProductSummary = {
  code: string;
  title: string;
  moduleCount: number;
};

type SharedModuleSummary = {
  code: string;
  title: string;
  products: Array<{
    code: string;
    title: string;
  }>;
};

type GridPosition = {
  desktopColumn: number;
  desktopRow: number;
  tabletColumn: number;
  tabletRow: number;
  mobileRow: number;
};

type PackageGroup = {
  name: string;
  moduleCount: number;
  products: Array<{
    name: string;
    icon: ProductIconKey;
  }>;
  position: GridPosition;
};

type OfficialProductPosition = {
  icon: ProductIconKey;
  desktopColumn: number;
  desktopRow: number;
  tabletColumn: number;
  tabletRow: number;
  mobileColumn: number;
  mobileRow: number;
};

const productGridPositions: Record<string, GridPosition> = {
  CORE: { desktopColumn: 1, desktopRow: 1, tabletColumn: 1, tabletRow: 1, mobileRow: 1 },
  CONNECTIVITY: { desktopColumn: 2, desktopRow: 1, tabletColumn: 2, tabletRow: 1, mobileRow: 2 },
  CNC: { desktopColumn: 3, desktopRow: 1, tabletColumn: 3, tabletRow: 1, mobileRow: 3 },
  MONITORA: { desktopColumn: 4, desktopRow: 1, tabletColumn: 1, tabletRow: 2, mobileRow: 4 },
  OEE: { desktopColumn: 5, desktopRow: 1, tabletColumn: 2, tabletRow: 2, mobileRow: 5 },
  İZLENEBILIRLIK: { desktopColumn: 1, desktopRow: 2, tabletColumn: 3, tabletRow: 2, mobileRow: 6 },
  DSF: { desktopColumn: 2, desktopRow: 2, tabletColumn: 1, tabletRow: 3, mobileRow: 7 },
  OPCTMC: { desktopColumn: 3, desktopRow: 2, tabletColumn: 2, tabletRow: 3, mobileRow: 8 },
  INTELLIGENCE: { desktopColumn: 4, desktopRow: 2, tabletColumn: 3, tabletRow: 3, mobileRow: 9 },
  CARBONIQ: { desktopColumn: 5, desktopRow: 2, tabletColumn: 1, tabletRow: 4, mobileRow: 10 },
  ENTEGRASYON: { desktopColumn: 1, desktopRow: 3, tabletColumn: 2, tabletRow: 4, mobileRow: 11 },
  LMS: { desktopColumn: 2, desktopRow: 3, tabletColumn: 3, tabletRow: 4, mobileRow: 12 },
  APPROVE: { desktopColumn: 3, desktopRow: 3, tabletColumn: 1, tabletRow: 5, mobileRow: 13 },
  ENGAGE: { desktopColumn: 4, desktopRow: 3, tabletColumn: 2, tabletRow: 5, mobileRow: 14 },
  INFORM: { desktopColumn: 5, desktopRow: 3, tabletColumn: 3, tabletRow: 5, mobileRow: 15 },
};

const packageGroups: PackageGroup[] = [
  {
    name: "Endüstriyel İletişim",
    moduleCount: 2,
    products: [{ name: "Connect", icon: "connect" }, { name: "Core", icon: "core" }],
    position: { desktopColumn: 1, desktopRow: 1, tabletColumn: 1, tabletRow: 1, mobileRow: 1 },
  },
  {
    name: "CNC Entegrasyonu",
    moduleCount: 3,
    products: [{ name: "CNC", icon: "cnc" }, { name: "Connect", icon: "connect" }, { name: "Live", icon: "live" }],
    position: { desktopColumn: 2, desktopRow: 1, tabletColumn: 2, tabletRow: 1, mobileRow: 2 },
  },
  {
    name: "Gerçek Zamanlı İzleme",
    moduleCount: 3,
    products: [{ name: "Live", icon: "live" }, { name: "Connect", icon: "connect" }, { name: "Core", icon: "core" }],
    position: { desktopColumn: 3, desktopRow: 1, tabletColumn: 1, tabletRow: 2, mobileRow: 3 },
  },
  {
    name: "Performans ve OEE",
    moduleCount: 3,
    products: [{ name: "Optima", icon: "optima" }, { name: "Live", icon: "live" }, { name: "Core", icon: "core" }],
    position: { desktopColumn: 1, desktopRow: 2, tabletColumn: 2, tabletRow: 2, mobileRow: 4 },
  },
  {
    name: "Ürün İzlenebilirliği",
    moduleCount: 3,
    products: [{ name: "Trace", icon: "trace" }, { name: "Forms", icon: "forms" }, { name: "Core", icon: "core" }],
    position: { desktopColumn: 2, desktopRow: 2, tabletColumn: 1, tabletRow: 3, mobileRow: 5 },
  },
  {
    name: "Dijital Saha Süreçleri",
    moduleCount: 2,
    products: [{ name: "Forms", icon: "forms" }, { name: "Core", icon: "core" }],
    position: { desktopColumn: 3, desktopRow: 2, tabletColumn: 2, tabletRow: 3, mobileRow: 6 },
  },
  {
    name: "Kurumsal Sistem Entegrasyonu",
    moduleCount: 2,
    products: [{ name: "Integra", icon: "integra" }, { name: "Core", icon: "core" }],
    position: { desktopColumn: 1, desktopRow: 3, tabletColumn: 1, tabletRow: 4, mobileRow: 7 },
  },
  {
    name: "Enerji Görünürlüğü",
    moduleCount: 2,
    products: [{ name: "Energy", icon: "energy" }, { name: "Connect", icon: "connect" }],
    position: { desktopColumn: 2, desktopRow: 3, tabletColumn: 2, tabletRow: 4, mobileRow: 8 },
  },
  {
    name: "Tütün Makinesi Entegrasyonu",
    moduleCount: 3,
    products: [{ name: "TMC", icon: "tmc" }, { name: "Connect", icon: "connect" }, { name: "Live", icon: "live" }],
    position: { desktopColumn: 3, desktopRow: 3, tabletColumn: 1, tabletRow: 5, mobileRow: 9 },
  },
];

const officialProductPositions: Record<string, OfficialProductPosition> = {
  Connect: { icon: "connect", desktopColumn: 1, desktopRow: 1, tabletColumn: 1, tabletRow: 1, mobileColumn: 1, mobileRow: 1 },
  Live: { icon: "live", desktopColumn: 2, desktopRow: 1, tabletColumn: 2, tabletRow: 1, mobileColumn: 2, mobileRow: 1 },
  Optima: { icon: "optima", desktopColumn: 3, desktopRow: 1, tabletColumn: 3, tabletRow: 1, mobileColumn: 1, mobileRow: 2 },
  Trace: { icon: "trace", desktopColumn: 4, desktopRow: 1, tabletColumn: 1, tabletRow: 2, mobileColumn: 2, mobileRow: 2 },
  Forms: { icon: "forms", desktopColumn: 1, desktopRow: 2, tabletColumn: 2, tabletRow: 2, mobileColumn: 1, mobileRow: 3 },
  CNC: { icon: "cnc", desktopColumn: 2, desktopRow: 2, tabletColumn: 3, tabletRow: 2, mobileColumn: 2, mobileRow: 3 },
  TMC: { icon: "tmc", desktopColumn: 3, desktopRow: 2, tabletColumn: 1, tabletRow: 3, mobileColumn: 1, mobileRow: 4 },
  Integra: { icon: "integra", desktopColumn: 4, desktopRow: 2, tabletColumn: 2, tabletRow: 3, mobileColumn: 2, mobileRow: 4 },
  Energy: { icon: "energy", desktopColumn: 1, desktopRow: 3, tabletColumn: 3, tabletRow: 3, mobileColumn: 1, mobileRow: 5 },
  Green: { icon: "green", desktopColumn: 2, desktopRow: 3, tabletColumn: 1, tabletRow: 4, mobileColumn: 2, mobileRow: 5 },
  Core: { icon: "core", desktopColumn: 3, desktopRow: 3, tabletColumn: 2, tabletRow: 4, mobileColumn: 1, mobileRow: 6 },
  Engage: { icon: "engage", desktopColumn: 4, desktopRow: 3, tabletColumn: 3, tabletRow: 4, mobileColumn: 2, mobileRow: 6 },
};

const sharedOfficialPath = ["Connect", "Live", "Optima", "Energy", "Trace", "Integra", "Engage"] as const;

const officialStartingRoutes = [
  ["Connect", "Live", "Optima"],
  ["Energy", "Green"],
  ["Trace", "Forms", "Integra"],
] as const;

function ProductsGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="product-fixed-grid" aria-label="OnSuite ürünleri">
      {products.map((product) => {
        const position = productGridPositions[product.code];
        const icon = productIconByCode[product.code];

        if (!position || !icon) {
          return null;
        }

        return (
          <article
            className="product-grid-card"
            key={product.code}
            style={{
              "--product-column": position.desktopColumn,
              "--product-row": position.desktopRow,
              "--product-tablet-column": position.tabletColumn,
              "--product-tablet-row": position.tabletRow,
              "--product-mobile-row": position.mobileRow,
            } as CSSProperties}
          >
            <ProductIcon icon={icon} />
            <div className="product-grid-card-copy">
              <strong>{product.title}</strong>
              <span>{product.moduleCount} modül</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function SharedModulesList({ modules }: { modules: SharedModuleSummary[] }) {
  return (
    <div className="shared-module-table" role="table" aria-label="Paylaşılan modüller">
      <div className="shared-module-table-header" role="row">
        <span role="columnheader">Modül</span>
        <span role="columnheader">Kullanıldığı ürünler</span>
      </div>
      <div className="shared-module-table-body" role="rowgroup">
        {modules.map((module) => (
          <article className="shared-module-row" role="row" key={module.code}>
            <strong role="cell">{module.title}</strong>
            <div className="shared-module-products" role="cell">
              {module.products.map((product) => {
                const icon = productIconByCode[product.code];

                return (
                  <span className="shared-module-product-badge" key={product.code}>
                    {icon ? <ProductIcon icon={icon} /> : null}
                    {product.title}
                  </span>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PackageGroupsGrid() {
  return (
    <div className="package-fixed-grid" aria-label="İhtiyaca göre paketler">
      {packageGroups.map((group) => (
        <article
          className="package-group-card"
          key={group.name}
          style={{
            "--package-column": group.position.desktopColumn,
            "--package-row": group.position.desktopRow,
            "--package-tablet-column": group.position.tabletColumn,
            "--package-tablet-row": group.position.tabletRow,
            "--package-mobile-row": group.position.mobileRow,
          } as CSSProperties}
        >
          <div className="package-group-card-heading">
            <h3>{group.name}</h3>
            <span className="package-module-count">{group.moduleCount} MODÜL</span>
          </div>
          <div className="package-product-tags" aria-label={`${group.name} ürünleri`}>
            {group.products.map((product) => (
              <span className="package-product-tag" key={product.name}>
                <ProductIcon icon={product.icon} />
                {product.name}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function OfficialPathProduct({ name }: { name: string }) {
  const product = officialProductPositions[name];

  return (
    <span className="official-path-product">
      <ProductIcon icon={product.icon} />
      <strong>{name}</strong>
    </span>
  );
}

function OfficialProductRoadmap() {
  return (
    <div className="official-product-roadmap">
      <div className="official-roadmap-block">
        <p className="official-roadmap-label">RESMİ 12 ÜRÜN</p>
        <div className="official-product-grid" aria-label="Resmi OnSuite ürünleri">
          {publicProducts.products.map((product) => {
            const position = officialProductPositions[product.name];

            return (
              <article
                className="official-product-card"
                key={product.name}
                style={{
                  "--official-column": position.desktopColumn,
                  "--official-row": position.desktopRow,
                  "--official-tablet-column": position.tabletColumn,
                  "--official-tablet-row": position.tabletRow,
                  "--official-mobile-column": position.mobileColumn,
                  "--official-mobile-row": position.mobileRow,
                } as CSSProperties}
              >
                <ProductIcon icon={position.icon} />
                <strong>{product.name}</strong>
              </article>
            );
          })}
        </div>
      </div>

      <div className="official-roadmap-block">
        <h3>Ortak ürün yolu</h3>
        <div className="official-path-sequence" aria-label={sharedOfficialPath.join(", ardından ")}>
          {sharedOfficialPath.map((name, index) => (
            <div className="official-path-step" key={name}>
              <OfficialPathProduct name={name} />
              {index < sharedOfficialPath.length - 1 ? <span className="official-path-arrow" aria-hidden="true">→</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="official-roadmap-block">
        <h3>Başlangıç rotaları</h3>
        <div className="official-starting-routes">
          {officialStartingRoutes.map((route, routeIndex) => (
            <article className="official-route-card" key={route.join("-")}>
              <span className="official-route-number">0{routeIndex + 1}</span>
              <div className="official-route-sequence" aria-label={route.join(", ardından ")}>
                {route.map((name, index) => (
                  <div className="official-route-step" key={name}>
                    <OfficialPathProduct name={name} />
                    {index < route.length - 1 ? <span className="official-route-arrow" aria-hidden="true">→</span> : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductCatalog({
  products,
  sharedModules,
}: {
  products: ProductSummary[];
  sharedModules: SharedModuleSummary[];
}) {
  return (
    <div className="product-catalog-stack">
      <section className="catalog-section" aria-labelledby="packages-section-title">
        <header className="catalog-section-heading">
          <h2 id="packages-section-title">İhtiyaca Göre Paketler</h2>
        </header>
        <PackageGroupsGrid />
      </section>

      <section className="catalog-section" aria-labelledby="shared-section-title">
        <header className="catalog-section-heading">
          <h2 id="shared-section-title">Paylaşılan Modüller</h2>
        </header>
        <SharedModulesList modules={sharedModules} />
      </section>

      <section className="catalog-section" aria-labelledby="products-section-title">
        <header className="catalog-section-heading">
          <h2 id="products-section-title">Tüm Ürünler</h2>
        </header>
        <ProductsGrid products={products} />
      </section>

      <section className="catalog-section" aria-labelledby="official-path-section-title">
        <header className="catalog-section-heading">
          <h2 id="official-path-section-title">Resmi Ürün Yolu</h2>
        </header>
        <OfficialProductRoadmap />
      </section>
    </div>
  );
}
