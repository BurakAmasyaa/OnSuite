"use client";

import { useState, type CSSProperties } from "react";
import { ProductIcon, type ProductIconKey } from "@/components/product-icon";
import publicProducts from "@/data/public-products.json";

type OfficialProductPosition = {
  icon: ProductIconKey;
  desktopColumn: number;
  desktopRow: number;
  tabletColumn: number;
  tabletRow: number;
  mobileColumn: number;
  mobileRow: number;
};

type ProductFilter = {
  id: string;
  label: string;
  products: readonly string[];
};

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

const officialRouteLabels = [
  "01 · Üretim Verisi ve Performans",
  "02 · Enerji ve Sürdürülebilirlik",
  "03 · İzlenebilirlik ve Dijital Süreçler",
] as const;

const sectorFilters: ProductFilter[] = [
  { id: "sector-automotive", label: "Otomotiv Yan Sanayi", products: ["Connect", "Live", "Optima", "Trace", "Forms", "Integra"] },
  { id: "sector-white-goods", label: "Beyaz Eşya", products: ["Connect", "Live", "Optima", "Trace", "Forms"] },
  { id: "sector-food", label: "Gıda", products: ["Connect", "Trace", "Forms", "Integra"] },
  { id: "sector-tobacco", label: "Tütün", products: ["TMC", "Connect", "Live", "Optima"] },
];

const useCaseFilters: ProductFilter[] = [
  { id: "purpose-visibility", label: "Üretimi görmek istiyorum", products: ["Connect", "Live"] },
  { id: "purpose-efficiency", label: "Verimliliği artırmak istiyorum", products: ["Connect", "Live", "Optima"] },
  { id: "purpose-integration", label: "Sistemleri entegre etmek istiyorum", products: ["Connect", "Optima", "Integra"] },
  { id: "purpose-crisis", label: "Kriz yönetimini güçlendirmek istiyorum", products: ["Engage"] },
];

const allFilters = [...sectorFilters, ...useCaseFilters];

function OfficialPathProduct({ name, stateClass }: { name: string; stateClass: string }) {
  const product = officialProductPositions[name];

  return (
    <span className={`official-path-product${stateClass}`}>
      <ProductIcon icon={product.icon} />
      <strong>{name}</strong>
    </span>
  );
}

function FilterGroup({
  title,
  filters,
  activeFilterId,
  onSelect,
}: {
  title: string;
  filters: ProductFilter[];
  activeFilterId: string | null;
  onSelect: (filterId: string) => void;
}) {
  return (
    <div className="official-filter-group">
      <strong>{title}</strong>
      <div className="official-filter-pills" role="group" aria-label={title}>
        {filters.map((filter) => (
          <button
            className={`official-filter-pill${activeFilterId === filter.id ? " is-active" : ""}`}
            type="button"
            aria-pressed={activeFilterId === filter.id}
            key={filter.id}
            onClick={() => onSelect(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OfficialProductRoadmap() {
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const activeFilter = allFilters.find((filter) => filter.id === activeFilterId) ?? null;
  const productStateClass = (productName: string) => {
    if (!activeFilter) return "";
    return activeFilter.products.includes(productName) ? " is-highlighted" : " is-dimmed";
  };
  const selectFilter = (filterId: string) => setActiveFilterId((current) => current === filterId ? null : filterId);

  return (
    <div className="official-product-roadmap">
      <div className="official-roadmap-block">
        <p className="official-roadmap-label">12 Ana Ürün</p>
        <div className="official-product-grid" aria-label="Resmi OnSuite ürünleri">
          {publicProducts.products.map((product) => {
            const position = officialProductPositions[product.name];

            return (
              <article
                className={`official-product-card${productStateClass(product.name)}`}
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

      <div className="official-filter-panel" aria-label="Ürün ekosistemi filtreleri">
        <FilterGroup title="Sektöre göre" filters={sectorFilters} activeFilterId={activeFilterId} onSelect={selectFilter} />
        <FilterGroup title="Kullanım amacına göre" filters={useCaseFilters} activeFilterId={activeFilterId} onSelect={selectFilter} />
        <p>Bir seçim yaptığınızda ilgili ürünler yukarıdaki kartlarda ve aşağıdaki akışlarda vurgulanır.</p>
      </div>

      <div className="official-roadmap-block">
        <h3>Önerilen Çözüm Akışı</h3>
        <p className="official-roadmap-description">Bu akış, müşterilerin ürünleri genellikle hangi sırayla devreye aldığını gösterir.</p>
        <div className="official-path-sequence" aria-label={sharedOfficialPath.join(", ardından ")}>
          {sharedOfficialPath.map((name, index) => (
            <div className="official-path-step" key={name}>
              <OfficialPathProduct name={name} stateClass={productStateClass(name)} />
              {index < sharedOfficialPath.length - 1 ? <span className="official-path-arrow" aria-hidden="true">→</span> : null}
            </div>
          ))}
        </div>
      </div>

      <div className="official-roadmap-block">
        <h3>İhtiyaca Göre Çözüm Yolları</h3>
        <p className="official-roadmap-description">Bu yollar, işletme hedefine göre sık kullanılan başlangıç kombinasyonlarını gösterir.</p>
        <div className="official-starting-routes">
          {officialStartingRoutes.map((route, routeIndex) => (
            <article className="official-route-card" key={route.join("-")}>
              <span className="official-route-number">{officialRouteLabels[routeIndex]}</span>
              <div className="official-route-sequence" aria-label={route.join(", ardından ")}>
                {route.map((name, index) => (
                  <div className="official-route-step" key={name}>
                    <OfficialPathProduct name={name} stateClass={productStateClass(name)} />
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
