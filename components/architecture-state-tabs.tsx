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

const orbitCenter = { x: 460, y: 220 };
const orbitRadius = 165;

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

function TodayArchitecture() {
  return (
    <div className="today-architecture-scroll" tabIndex={0} aria-label="Bugünkü sistem bağlantıları, yatay kaydırılabilir">
      <div className="today-architecture-canvas">
        <svg
          className="today-architecture-lines"
          viewBox="0 0 920 410"
          role="img"
          aria-label="Sekiz sistemden yeni sisteme uzanan bağlantı çizgileri"
        >
          <line className="is-solid" x1="220" y1="65" x2="720" y2="198" />
          <line className="is-dashed" x1="460" y1="65" x2="720" y2="210" />
          <line className="is-dashed" x1="220" y1="159" x2="720" y2="222" />
          <line className="is-solid" x1="460" y1="159" x2="720" y2="198" />
          <line className="is-solid" x1="220" y1="253" x2="720" y2="222" />
          <line className="is-dashed" x1="460" y1="253" x2="720" y2="210" />
          <line className="is-dashed" x1="220" y1="347" x2="720" y2="198" />
          <line className="is-solid" x1="460" y1="347" x2="720" y2="222" />

          <g className="today-warning-marker" transform="translate(508 199)">
            <circle r="11" />
            <text textAnchor="middle" y="4">!</text>
          </g>
          <g className="today-warning-marker" transform="translate(605 232)">
            <circle r="11" />
            <text textAnchor="middle" y="4">!</text>
          </g>
        </svg>

        {todaySystems.map((system) => (
          <div
            className="today-system-node"
            key={system.label}
            style={{ "--system-x": `${system.x}px`, "--system-y": `${system.y}px` } as CSSProperties}
          >
            {system.label}
          </div>
        ))}

        <div className="today-new-system-node">
          <span>Bağlantı talebi</span>
          <strong>Yeni Sistem Ekleniyor...</strong>
        </div>
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
          viewBox="0 0 920 440"
          role="img"
          aria-label="OnSuite merkezinden sekiz sisteme uzanan bağlantılar"
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
