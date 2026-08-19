"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/harita", label: "Ürün-Modül Kataloğu" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Ana navigasyon">
        <Link className="brand" href="/">On<span>Suite</span></Link>
        <div className="nav-links">
          {links.map((link) => (
            <Link
              className="nav-link"
              data-active={pathname === link.href}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
