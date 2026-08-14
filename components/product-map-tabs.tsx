"use client";

import { useState, type CSSProperties } from "react";

type ProductTab = "products" | "shared";

type ProductSummary = {
  code: string;
  title: string;
  moduleCount: number;
};

type GridPosition = {
  desktopColumn: number;
  desktopRow: number;
  tabletColumn: number;
  tabletRow: number;
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

export function ProductMapTabs({ products }: { products: ProductSummary[] }) {
  const [activeTab, setActiveTab] = useState<ProductTab>("products");

  return (
    <section className="product-map-tabs" aria-labelledby="product-map-tabs-title">
      <div className="product-map-tabs-heading">
        <p className="eyebrow">Katalog görünümü</p>
        <h2 id="product-map-tabs-title">Ürün ve modül kapsamı</h2>
      </div>

      <div className="product-map-tab-list" role="tablist" aria-label="Ürün haritası görünümü">
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
      </div>

      {activeTab === "products" ? (
        <div
          id="product-map-panel-products"
          role="tabpanel"
          aria-labelledby="product-map-tab-products"
        >
          <ProductsGrid products={products} />
        </div>
      ) : (
        <div
          className="product-map-placeholder"
          id="product-map-panel-shared"
          role="tabpanel"
          aria-labelledby="product-map-tab-shared"
        >
          <p>Paylaşılan modüller görünümü yakında eklenecek.</p>
        </div>
      )}
    </section>
  );
}
