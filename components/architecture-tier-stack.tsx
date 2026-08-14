"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ArchitectureTierStack({ children }: { children: ReactNode }) {
  const stackRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

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

  return (
    <section
      ref={stackRef}
      className={`architecture-stack${hasEntered ? " is-entered" : ""}`}
      aria-label="OnSuite üretim mimarisi katmanları"
    >
      {children}
    </section>
  );
}
