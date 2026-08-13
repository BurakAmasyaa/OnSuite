import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      "https://onsuite-urun-mimarisi.amasya-sisko-2962.chatgpt.site",
  ),
  title: {
    default: "OnSuite Ürün Mimarisi",
    template: "%s · OnSuite",
  },
  description: "OnSuite ürünlerini, modüllerini ve paylaşılan yeteneklerini keşfedin.",
  openGraph: {
    title: "OnSuite Ürün Mimarisi",
    description: "Ürünlerden modüllere, bütün mimari tek bakışta.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OnSuite Ürün Mimarisi" }],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OnSuite Ürün Mimarisi",
    description: "Ürünlerden modüllere, bütün mimari tek bakışta.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
