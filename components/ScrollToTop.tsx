"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function ScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const hash = window.location.hash;
    if (hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        html.style.scrollBehavior = previous;
        return;
      }
    }

    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }, [pathname]);

  return null;
}
