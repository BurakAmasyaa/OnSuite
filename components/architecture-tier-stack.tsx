"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type UIEvent,
} from "react";
import { ProductIcon, type ProductIconKey } from "@/components/product-icon";

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

function ArchitectureLayerPattern({ tone }: Pick<ArchitectureTier, "tone">) {
  const patternId = `architecture-pattern-${tone}`;

  return (
    <svg
      className="architecture-layer-pattern"
      viewBox="0 0 720 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {tone === "field" ? (
          <pattern id={patternId} width="120" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M0 18h34v22h32v24h54M18 0v28h32M92 0v22H72v26h32v32" />
              <circle cx="34" cy="40" r="2.5" />
              <circle cx="66" cy="64" r="2.5" />
              <circle cx="72" cy="48" r="2.5" />
            </g>
          </pattern>
        ) : null}
        {tone === "core" ? (
          <pattern id={patternId} width="160" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 76 54 24l50 28 44-36M54 24l2 62 48-34 34 38" />
              <circle cx="12" cy="76" r="3" />
              <circle cx="54" cy="24" r="3" />
              <circle cx="56" cy="86" r="3" />
              <circle cx="104" cy="52" r="3" />
              <circle cx="148" cy="16" r="3" />
              <circle cx="138" cy="90" r="3" />
            </g>
          </pattern>
        ) : null}
        {tone === "modules" ? (
          <pattern id={patternId} width="180" height="100" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M14 12v72h152M24 68l30-22 28 11 31-34 42 20" />
              <path d="M34 76V62M69 76V55M104 76V38M139 76V49" strokeWidth="5" />
              <circle cx="54" cy="46" r="2.5" />
              <circle cx="82" cy="57" r="2.5" />
              <circle cx="113" cy="23" r="2.5" />
            </g>
          </pattern>
        ) : null}
        {tone === "output" ? (
          <pattern id={patternId} width="160" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2">
              <path d="M4 20h116m-8-6 8 6-8 6M36 60h116m-8-6 8 6-8 6M18 70 70 18m-1 10 1-10-10 1" />
            </g>
          </pattern>
        ) : null}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

function FlowArrow({ index }: { index: number }) {
  const pulseStyle = { "--flow-pulse-delay": `${index * 280}ms` } as CSSProperties;

  return (
    <div className="architecture-arrow" aria-hidden="true">
      <span>→</span>
      <i className="architecture-flow-pulse" style={pulseStyle} />
    </div>
  );
}

export function ArchitectureTierStack({ tiers }: { tiers: ArchitectureTier[] }) {
  const stackRef = useRef<HTMLElement>(null);
  const hasInteractedRef = useRef(false);
  const tierSlotsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [hasEntered, setHasEntered] = useState(false);
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [visibleTier, setVisibleTier] = useState(0);

  useEffect(() => {
    const stack = stackRef.current;

    if (!stack || !("IntersectionObserver" in window)) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(stack);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (
      !hasEntered ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 900px)").matches
    ) {
      return;
    }

    const hintStart = window.setTimeout(() => {
      if (!hasInteractedRef.current) {
        setExpandedTier(0);
      }
    }, 1460);

    const hintEnd = window.setTimeout(() => {
      if (!hasInteractedRef.current) {
        setExpandedTier((current) => (current === 0 ? null : current));
      }
    }, 2660);

    return () => {
      window.clearTimeout(hintStart);
      window.clearTimeout(hintEnd);
    };
  }, [hasEntered]);

  const isCompactLayout = () => window.matchMedia("(max-width: 900px)").matches;

  const handlePointerEnter = (event: PointerEvent<HTMLElement>, index: number) => {
    if (event.pointerType === "mouse" && !isCompactLayout()) {
      hasInteractedRef.current = true;
      setExpandedTier(index);
    }
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (
      event.pointerType === "mouse" &&
      !isCompactLayout() &&
      !event.currentTarget.contains(document.activeElement)
    ) {
      setExpandedTier(null);
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    if (isCompactLayout() || event.detail === 0) {
      hasInteractedRef.current = true;
      setVisibleTier(index);
      setExpandedTier((current) => (current === index ? null : index));
    }
  };

  const handleFocus = (index: number) => {
    if (!isCompactLayout()) {
      hasInteractedRef.current = true;
      setExpandedTier(index);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget) && !isCompactLayout()) {
      setExpandedTier(null);
    }
  };

  const handleMobileScroll = (event: UIEvent<HTMLElement>) => {
    if (!window.matchMedia("(max-width: 600px)").matches) {
      return;
    }

    const container = event.currentTarget;
    const viewportCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    tierSlotsRef.current.forEach((slot, index) => {
      if (!slot) {
        return;
      }

      const slotCenter = slot.offsetLeft + slot.offsetWidth / 2;
      const distance = Math.abs(slotCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setVisibleTier((current) => (current === closestIndex ? current : closestIndex));
  };

  return (
    <div className="architecture-flow-shell">
      <div className="architecture-continuous-rail" aria-hidden="true">
        <i />
      </div>
      <section
        ref={stackRef}
        className={`architecture-stack${hasEntered ? " is-entered" : ""}${expandedTier !== null ? " has-expanded" : ""}`}
        aria-label="OnSuite üretim mimarisi katmanları"
        onScroll={handleMobileScroll}
      >
        {tiers.map((tier, index) => {
          const isExpanded = expandedTier === index;
          const detailId = `architecture-tier-detail-${index}`;
          const entranceStyle = { "--tier-delay": `${index * 100}ms` } as CSSProperties;

          return (
            <div
              ref={(element) => {
                tierSlotsRef.current[index] = element;
              }}
              className={`architecture-tier-slot${isExpanded ? " is-active-slot" : ""}`}
              key={tier.tone}
            >
              <article
                className={`architecture-layer architecture-layer-${tier.tone}${isExpanded ? " is-expanded" : ""}`}
                style={entranceStyle}
                onPointerEnter={(event) => handlePointerEnter(event, index)}
                onPointerLeave={handlePointerLeave}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
              >
                <ArchitectureLayerPattern tone={tier.tone} />
                <button
                  className="architecture-layer-summary"
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={detailId}
                  onClick={(event) => handleClick(event, index)}
                >
                  {tier.tierIcon ? (
                    <span className="architecture-tier-icon">
                      <ProductIcon icon={tier.tierIcon} />
                    </span>
                  ) : (
                    <span className="architecture-number">{tier.number}</span>
                  )}
                  <h2>{tier.title}</h2>
                  <span className="architecture-expand-hint" aria-hidden="true">
                    <span className="architecture-expand-hint-desktop">Detaylar için üzerine gelin</span>
                    <span className="architecture-expand-hint-mobile">Detayları {isExpanded ? "gizle" : "göster"}</span>
                  </span>
                </button>

                <div
                  id={detailId}
                  className="architecture-layer-details"
                  aria-hidden={!isExpanded}
                >
                  <p className="architecture-layer-eyebrow">{tier.eyebrow}</p>
                  <p className="architecture-layer-description">{tier.description}</p>
                  {tier.processSteps ? (
                    <ol className="architecture-process-flow" aria-label={`${tier.title} veri işleme adımları`}>
                      {tier.processSteps.map((step) => <li key={step}>{step}</li>)}
                    </ol>
                  ) : null}
                  <div className="architecture-badge-group">
                    {tier.badgeLabel ? <p className="architecture-badge-label">{tier.badgeLabel}</p> : null}
                    <div className="architecture-badges" aria-label={`${tier.title} bileşenleri`}>
                      {tier.badges.map((badge) => (
                        <span key={badge.label}>
                          {badge.icon ? <ProductIcon icon={badge.icon} /> : null}
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {tier.flowCue ? <p className="architecture-flow-cue"><span aria-hidden="true">↔</span>{tier.flowCue}</p> : null}
                </div>
              </article>
              {index < tiers.length - 1 ? <FlowArrow index={index} /> : null}
            </div>
          );
        })}
      </section>
      <p className="architecture-step-indicator" aria-live="polite">
        {String(visibleTier + 1).padStart(2, "0")} / {String(tiers.length).padStart(2, "0")}
      </p>
    </div>
  );
}
