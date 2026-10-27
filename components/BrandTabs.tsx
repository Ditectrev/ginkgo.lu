"use client";

import { useState } from "react";
import type { BrandLogo } from "@/lib/brands";

export function BrandTabs({ labels, groups }: { labels: string[]; groups: BrandLogo[][] }) {
  const [active, setActive] = useState(0);
  const logos = groups[active] ?? [];

  return (
    <div>
      <div className="brand-tabs" role="tablist">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => setActive(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="logo-grid" role="tabpanel">
        {logos.map((logo) => (
          <div className="logo-tile" key={`${logo.src}-${logo.alt}`}>
            <img src={logo.src} alt={logo.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}
