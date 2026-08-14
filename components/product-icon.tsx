import Image from "next/image";

export type ProductIconKey =
  | "core"
  | "connect"
  | "cnc"
  | "live"
  | "optima"
  | "trace"
  | "forms"
  | "tmc"
  | "energy"
  | "green"
  | "integra"
  | "insight"
  | "inform"
  | "approve"
  | "engage"
  | "training";

export const productIconByCode: Record<string, ProductIconKey> = {
  CORE: "core",
  CONNECTIVITY: "connect",
  CNC: "cnc",
  MONITORA: "live",
  OEE: "optima",
  İZLENEBILIRLIK: "trace",
  DSF: "forms",
  OPCTMC: "tmc",
  INTELLIGENCE: "insight",
  CARBONIQ: "green",
  ENTEGRASYON: "integra",
  LMS: "training",
  APPROVE: "approve",
  ENGAGE: "engage",
  INFORM: "inform",
};

const siskonIconSource: Partial<Record<ProductIconKey, string>> = {
  core: "/icons/products/core.svg",
  connect: "/icons/products/connect.svg",
  cnc: "/icons/products/cnc.svg",
  live: "/icons/products/live.svg",
  optima: "/icons/products/optima.svg",
  trace: "/icons/products/trace.svg",
  forms: "/icons/products/forms.svg",
  tmc: "/icons/products/tmc.svg",
  energy: "/icons/products/energy.svg",
  green: "/icons/products/green.svg",
  integra: "/icons/products/integra.svg",
};

function IconArtwork({ icon }: { icon: ProductIconKey }) {
  switch (icon) {
    case "core":
      return <><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.4" /><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5" /></>;
    case "connect":
      return <><path d="M4.5 9.2a10.6 10.6 0 0 1 15 0M7.5 12.2a6.4 6.4 0 0 1 9 0M10.3 15.1a2.5 2.5 0 0 1 3.4 0" /><circle cx="12" cy="18" r="1" /></>;
    case "cnc":
      return <><circle cx="12" cy="12" r="2.2" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="8" /><path d="M12 4v3M20 12h-3" /></>;
    case "live":
      return <path d="M2.5 12h4l2-5 3.2 10 2.8-7 2 2h5" />;
    case "optima":
      return <><path d="M4 20V5M4 20h17" /><path d="M7 17v-4M11 17V9M15 17V6M19 17V3" /></>;
    case "trace":
      return <><path d="m7 7 4 4m2-1 4-4m-4 7 4 4M10 13l-4 4" /><circle cx="5" cy="5" r="2" /><circle cx="18.5" cy="4.5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="19" r="2" /><circle cx="4.5" cy="19" r="2" /></>;
    case "forms":
      return <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5V3h6v1.5M8.5 10l1.3 1.3 2.2-2.5M13.5 10h3M8.5 15l1.3 1.3 2.2-2.5M13.5 15h3" /></>;
    case "tmc":
      return <><rect x="9" y="3" width="6" height="4" rx="1" /><rect x="3" y="17" width="6" height="4" rx="1" /><rect x="15" y="17" width="6" height="4" rx="1" /><path d="M12 7v5M6 17v-5h12v5" /></>;
    case "energy":
      return <path d="m13.5 2.5-7 11h5l-1 8 7-11h-5l1-8Z" />;
    case "green":
      return <><path d="M19.5 4.5C11 4.5 5.5 8.5 5.5 14a5.5 5.5 0 0 0 10.4 2.5c1.8-3.5 2.2-8 3.6-12Z" /><path d="M4 20c3-4.5 6.5-7.2 11.5-10" /></>;
    case "integra":
      return <><path d="M5 8a8 8 0 0 1 13-2l2 2M20 4v4h-4M19 16a8 8 0 0 1-13 2l-2-2M4 20v-4h4" /></>;
    case "insight":
      return <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /><path d="M18.5 3.5v3M17 5h3" /></>;
    case "inform":
      return <><path d="m4 11 11-5v12L4 13v-2Z" /><path d="M7 14v5h4v-3M18 9c1 1 1 5 0 6" /></>;
    case "approve":
      return <><path d="M12 3 5 6v5c0 4.8 2.8 8.1 7 10 4.2-1.9 7-5.2 7-10V6l-7-3Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>;
    case "engage":
      return <><path d="M4 5h11a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 4v-4H4a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" /><path d="M7 9h5M7 12h7" /></>;
    case "training":
      return <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 12.5V17c3 2.3 7 2.3 10 0v-4.5M21 9v6" /></>;
  }
}

export function ProductIcon({ icon }: { icon: ProductIconKey }) {
  const realIconSource = siskonIconSource[icon];

  return (
    <span
      className={`product-icon-tile product-icon-tile-${icon}`}
      data-icon-source={realIconSource ? "siskon" : "placeholder"}
      aria-hidden="true"
    >
      {realIconSource ? (
        <Image src={realIconSource} alt="" width={28} height={28} unoptimized />
      ) : (
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <IconArtwork icon={icon} />
        </svg>
      )}
    </span>
  );
}
