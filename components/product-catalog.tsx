import type { CSSProperties } from "react";
import { ProductIcon, productIconByCode, type ProductIconKey } from "@/components/product-icon";

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
    </div>
  );
}
