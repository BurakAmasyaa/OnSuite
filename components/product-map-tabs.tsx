"use client";

import { useState, type CSSProperties } from "react";

type ProductTab = "products" | "shared" | "packages";

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
    initial: string;
  }>;
  position: GridPosition;
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
    products: [{ name: "Connect", initial: "C" }, { name: "Core", initial: "C" }],
    position: { desktopColumn: 1, desktopRow: 1, tabletColumn: 1, tabletRow: 1, mobileRow: 1 },
  },
  {
    name: "CNC Entegrasyonu",
    moduleCount: 3,
    products: [{ name: "CNC", initial: "C" }, { name: "Connect", initial: "C" }, { name: "Live", initial: "L" }],
    position: { desktopColumn: 2, desktopRow: 1, tabletColumn: 2, tabletRow: 1, mobileRow: 2 },
  },
  {
    name: "Gerçek Zamanlı İzleme",
    moduleCount: 3,
    products: [{ name: "Live", initial: "L" }, { name: "Connect", initial: "C" }, { name: "Core", initial: "C" }],
    position: { desktopColumn: 3, desktopRow: 1, tabletColumn: 1, tabletRow: 2, mobileRow: 3 },
  },
  {
    name: "Performans ve OEE",
    moduleCount: 3,
    products: [{ name: "Optima", initial: "O" }, { name: "Live", initial: "L" }, { name: "Core", initial: "C" }],
    position: { desktopColumn: 1, desktopRow: 2, tabletColumn: 2, tabletRow: 2, mobileRow: 4 },
  },
  {
    name: "Ürün İzlenebilirliği",
    moduleCount: 3,
    products: [{ name: "Trace", initial: "T" }, { name: "Forms", initial: "F" }, { name: "Core", initial: "C" }],
    position: { desktopColumn: 2, desktopRow: 2, tabletColumn: 1, tabletRow: 3, mobileRow: 5 },
  },
  {
    name: "Dijital Saha Süreçleri",
    moduleCount: 2,
    products: [{ name: "Forms", initial: "F" }, { name: "Core", initial: "C" }],
    position: { desktopColumn: 3, desktopRow: 2, tabletColumn: 2, tabletRow: 3, mobileRow: 6 },
  },
  {
    name: "Kurumsal Sistem Entegrasyonu",
    moduleCount: 2,
    products: [{ name: "Integra", initial: "I" }, { name: "Core", initial: "C" }],
    position: { desktopColumn: 1, desktopRow: 3, tabletColumn: 1, tabletRow: 4, mobileRow: 7 },
  },
  {
    name: "Enerji Görünürlüğü",
    moduleCount: 2,
    products: [{ name: "Energy", initial: "E" }, { name: "Connect", initial: "C" }],
    position: { desktopColumn: 2, desktopRow: 3, tabletColumn: 2, tabletRow: 4, mobileRow: 8 },
  },
  {
    name: "Tütün Makinesi Entegrasyonu",
    moduleCount: 3,
    products: [{ name: "TMC", initial: "T" }, { name: "Connect", initial: "C" }, { name: "Live", initial: "L" }],
    position: { desktopColumn: 3, desktopRow: 3, tabletColumn: 1, tabletRow: 5, mobileRow: 9 },
  },
];

function ProductsGrid({ products }: { products: ProductSummary[] }) {
  return (
    <div className="product-fixed-grid" aria-label="OnSuite ürünleri">
      {products.map((product) => {
        const position = productGridPositions[product.code];

        if (!position) {
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
            <strong>{product.title}</strong>
            <span>{product.moduleCount} modül</span>
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
              {module.products.map((product) => (
                <span className="shared-module-product-badge" key={product.code}>
                  {product.title}
                </span>
              ))}
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
                <span className="package-product-initial" aria-hidden="true">{product.initial}</span>
                {product.name}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ProductMapTabs({
  products,
  sharedModules,
}: {
  products: ProductSummary[];
  sharedModules: SharedModuleSummary[];
}) {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");

  return (
    <section className="product-map-tabs" aria-labelledby="product-map-tabs-title">
      <div className="product-map-tabs-heading">
        <p className="eyebrow">Katalog görünümü</p>
        <h2 id="product-map-tabs-title">Ürün ve modül kapsamı</h2>
      </div>

      <div className="product-map-tab-list" role="tablist" aria-label="Ürün kataloğu görünümü">
        <button
          id="product-map-tab-products"
          type="button"
          role="tab"
          aria-controls="product-map-panel-products"
          aria-selected={activeTab === "products"}
          onClick={() => setActiveTab("products")}
        >
          Ürünler
        </button>
        <button
          id="product-map-tab-shared"
          type="button"
          role="tab"
          aria-controls="product-map-panel-shared"
          aria-selected={activeTab === "shared"}
          onClick={() => setActiveTab("shared")}
        >
          Paylaşılan Modüller
        </button>
        <button
          id="product-map-tab-packages"
          type="button"
          role="tab"
          aria-controls="product-map-panel-packages"
          aria-selected={activeTab === "packages"}
          onClick={() => setActiveTab("packages")}
        >
          İhtiyaca Göre Paketler
        </button>
      </div>

      {activeTab === "products" ? (
        <div
          id="product-map-panel-products"
          role="tabpanel"
          aria-labelledby="product-map-tab-products"
        >
          <ProductsGrid products={products} />
        </div>
      ) : activeTab === "shared" ? (
        <div
          id="product-map-panel-shared"
          role="tabpanel"
          aria-labelledby="product-map-tab-shared"
        >
          <SharedModulesList modules={sharedModules} />
        </div>
      ) : (
        <div
          id="product-map-panel-packages"
          role="tabpanel"
          aria-labelledby="product-map-tab-packages"
        >
          <PackageGroupsGrid />
        </div>
      )}
    </section>
  );
}
