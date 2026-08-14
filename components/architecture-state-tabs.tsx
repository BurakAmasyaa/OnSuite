"use client";

import { useState, type CSSProperties } from "react";

type ArchitectureTab = "today" | "onsuite";

const todaySystems = [
  { label: "PLC/SCADA", x: 40, y: 34 },
  { label: "ERP", x: 280, y: 34 },
  { label: "Üretim Takibi", x: 40, y: 128 },
  { label: "Performans/OEE", x: 280, y: 128 },
  { label: "İzlenebilirlik", x: 40, y: 222 },
  { label: "Enerji", x: 280, y: 222 },
  { label: "Saha Formları", x: 40, y: 316 },
  { label: "Bildirim", x: 280, y: 316 },
] as const;

const orbitCanvas = { width: 1150, height: 550 };
const orbitCenter = { x: orbitCanvas.width / 2, y: orbitCanvas.height / 2 };
const orbitRadius = 206.25;

const onsuiteSystems = todaySystems.map((system, index) => {
  const angle = index * 45;
  const radians = angle * (Math.PI / 180);
  const centerX = orbitCenter.x + Math.cos(radians) * orbitRadius;
  const centerY = orbitCenter.y + Math.sin(radians) * orbitRadius;

  return {
    label: system.label,
    angle,
    centerX,
    centerY,
    x: centerX - 75,
    y: centerY - 27,
  };
});

function DeviceAccessCard({ className, label }: { className: string; label: string }) {
  return (
    <div className={`architecture-device-card ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 32 32">
        <rect x="5" y="5" width="22" height="16" rx="2.5" />
        <path d="M12 27h8M16 21v6M3 25h26" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

function TodayArchitecture() {
  return (
    <div className="today-architecture-scroll" tabIndex={0} aria-label="Bugünkü sistem bağlantıları, yatay kaydırılabilir">
      <div className="today-architecture-canvas">
        <svg
          className="today-architecture-lines"
          viewBox="0 0 920 520"
          role="img"
          aria-label="Sekiz sistem ve kontrol kartından bağlantı talebine uzanan bağlantı çizgileri"
        >
          <line className="is-solid today-grid-connector" x1="220" y1="65" x2="720" y2="213" style={{ "--connector-delay": "160ms" } as CSSProperties} />
          <line className="is-dashed today-grid-connector" x1="460" y1="65" x2="720" y2="213" style={{ "--connector-delay": "240ms" } as CSSProperties} />
          <line className="is-dashed today-grid-connector" x1="220" y1="159" x2="720" y2="213" style={{ "--connector-delay": "320ms" } as CSSProperties} />
          <line className="is-solid today-grid-connector" x1="460" y1="159" x2="720" y2="213" style={{ "--connector-delay": "400ms" } as CSSProperties} />
          <line className="is-solid today-grid-connector" x1="220" y1="253" x2="720" y2="213" style={{ "--connector-delay": "480ms" } as CSSProperties} />
          <line className="is-dashed today-grid-connector" x1="460" y1="253" x2="720" y2="213" style={{ "--connector-delay": "560ms" } as CSSProperties} />
          <line className="is-dashed today-grid-connector" x1="220" y1="347" x2="720" y2="213" style={{ "--connector-delay": "640ms" } as CSSProperties} />
          <line className="is-solid today-grid-connector" x1="460" y1="347" x2="720" y2="213" style={{ "--connector-delay": "720ms" } as CSSProperties} />
          <polyline
            className="is-dashed today-device-line"
            points="190,466 804,466 804,248"
          />
          <circle
            className="today-device-signal"
            cx="190"
            cy="466"
            r="5"
          />

          <g className="today-warning-marker" transform="translate(508 199)">
            <circle r="11" />
            <text textAnchor="middle" y="4">!</text>
          </g>
          <g className="today-warning-marker" transform="translate(605 232)">
            <circle r="11" />
            <text textAnchor="middle" y="4">!</text>
          </g>
        </svg>

        {todaySystems.map((system, index) => (
          <div
            className="today-system-node"
            key={system.label}
            style={{
              "--system-x": `${system.x}px`,
              "--system-y": `${system.y}px`,
              "--node-delay": `${index * 80}ms`,
            } as CSSProperties}
          >
            {system.label}
          </div>
        ))}

        <div className="today-new-system-node">
          <span>Bağlantı talebi</span>
          <strong>Yeni Sistem Ekleniyor...</strong>
        </div>

        <DeviceAccessCard className="today-device-card" label="Tek tek kontrol" />
      </div>
    </div>
  );
}

function OnSuiteArchitecture() {
  return (
    <div className="onsuite-orbit-scroll" tabIndex={0} aria-label="OnSuite bağlantı mimarisi, yatay kaydırılabilir">
      <div className="onsuite-orbit-canvas">
        <svg
          className="onsuite-orbit-lines"
          viewBox={`0 0 ${orbitCanvas.width} ${orbitCanvas.height}`}
          role="img"
          aria-label="OnSuite merkezinden sekiz sisteme ve cihaz erişim kartına uzanan bağlantılar"
        >
          {onsuiteSystems.map((system, index) => (
            <g key={system.label}>
              <line
                x1={orbitCenter.x}
                y1={orbitCenter.y}
                x2={system.centerX}
                y2={system.centerY}
              />
              <circle
                className="onsuite-signal-pulse"
                cx={orbitCenter.x}
                cy={orbitCenter.y}
                r="5"
                style={{
                  "--pulse-dx": `${system.centerX - orbitCenter.x}px`,
                  "--pulse-dy": `${system.centerY - orbitCenter.y}px`,
                  "--pulse-delay": `${index * 150}ms`,
                } as CSSProperties}
              />
            </g>
          ))}
          <polyline
            className="onsuite-access-line"
            points="575,275 330,350 330,488 230,488"
          />
          <circle
            className="onsuite-access-signal"
            cx="230"
            cy="488"
            r="5"
          />
        </svg>

        {onsuiteSystems.map((system) => (
          <div
            className="onsuite-orbit-node"
            data-angle={system.angle}
            key={system.label}
            style={{ "--orbit-x": `${system.x}px`, "--orbit-y": `${system.y}px` } as CSSProperties}
          >
            {system.label}
          </div>
        ))}

        <div className="onsuite-center-hub">
          <span>Merkez katman</span>
          <strong>OnSuite</strong>
        </div>

        <DeviceAccessCard
          className="onsuite-device-card"
          label="Her cihazdan erişim"
        />
      </div>
    </div>
  );
}

export function ArchitectureStateTabs() {
  const [activeTab, setActiveTab] = useState<ArchitectureTab>("today");

  return (
    <section className="architecture-state-tabs" aria-labelledby="architecture-state-title">
      <div className="architecture-state-heading">
        <p className="eyebrow">Sistem bağlantıları</p>
        <h2 id="architecture-state-title">Üretim sistemlerinin bağlantı görünümü</h2>
      </div>

      <div className="architecture-tab-list" role="tablist" aria-label="Mimari durum seçimi">
        <button
          id="architecture-tab-today"
          type="button"
          role="tab"
          aria-controls="architecture-panel-today"
          aria-selected={activeTab === "today"}
          onClick={() => setActiveTab("today")}
        >
          Bugün
        </button>
        <button
          id="architecture-tab-onsuite"
          type="button"
          role="tab"
          aria-controls="architecture-panel-onsuite"
          aria-selected={activeTab === "onsuite"}
          onClick={() => setActiveTab("onsuite")}
        >
          OnSuite ile
        </button>
      </div>

      {activeTab === "today" ? (
        <div id="architecture-panel-today" role="tabpanel" aria-labelledby="architecture-tab-today">
          <TodayArchitecture />
        </div>
      ) : (
        <div
          id="architecture-panel-onsuite"
          role="tabpanel"
          aria-labelledby="architecture-tab-onsuite"
        >
          <OnSuiteArchitecture />
        </div>
      )}
    </section>
  );
}
