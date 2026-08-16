"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type MouseEvent } from "react";

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
          aria-label="Dokuz sistem ve kontrol kartından bağlantı talebine uzanan bağlantı çizgileri"
        >
          <line className="today-grid-connector" x1="220" y1="65" x2="720" y2="213" style={{ "--connector-delay": "160ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="460" y1="65" x2="720" y2="213" style={{ "--connector-delay": "240ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="220" y1="159" x2="720" y2="213" style={{ "--connector-delay": "320ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="460" y1="159" x2="720" y2="213" style={{ "--connector-delay": "400ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="220" y1="253" x2="720" y2="213" style={{ "--connector-delay": "480ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="460" y1="253" x2="720" y2="213" style={{ "--connector-delay": "560ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="220" y1="347" x2="720" y2="213" style={{ "--connector-delay": "640ms" } as CSSProperties} />
          <line className="today-grid-connector" x1="460" y1="347" x2="720" y2="213" style={{ "--connector-delay": "720ms" } as CSSProperties} />
          <line className="today-grid-connector today-device-connector" x1="500" y1="489" x2="720" y2="213" style={{ "--connector-delay": "800ms" } as CSSProperties} />
          <circle className="today-device-signal" cx="500" cy="489" r="5" />
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
            points="575,275 330,350 330,496 480,496"
          />
          <circle
            className="onsuite-access-signal"
            cx="575"
            cy="275"
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
  const [autoCycleEnabled, setAutoCycleEnabled] = useState(true);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !autoCycleEnabled || isHoverPaused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveTab((currentTab) => currentTab === "today" ? "onsuite" : "today");
    }, 4800);

    return () => window.clearTimeout(timer);
  }, [activeTab, autoCycleEnabled, isHoverPaused, prefersReducedMotion]);

  const handleTabClick = (nextTab: ArchitectureTab) => {
    setActiveTab(nextTab);

    if (!prefersReducedMotion) {
      setAutoCycleEnabled((isEnabled) => !isEnabled);
    }
  };

  const handleDiagramMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (event.relatedTarget !== null) {
      setIsHoverPaused(true);
    }
  };

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
          onClick={() => handleTabClick("today")}
        >
          Bugün
        </button>
        <button
          id="architecture-tab-onsuite"
          type="button"
          role="tab"
          aria-controls="architecture-panel-onsuite"
          aria-selected={activeTab === "onsuite"}
          onClick={() => handleTabClick("onsuite")}
        >
          OnSuite ile
        </button>
      </div>

      <div
        className="architecture-tab-stage"
        onMouseEnter={handleDiagramMouseEnter}
        onMouseLeave={() => setIsHoverPaused(false)}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeTab}
            id={`architecture-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`architecture-tab-${activeTab}`}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeInOut" }}
          >
            {activeTab === "today" ? <TodayArchitecture /> : <OnSuiteArchitecture />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
