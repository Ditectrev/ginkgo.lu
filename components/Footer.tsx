"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { langFromPath } from "@/lib/content";
import { copyFor } from "@/lib/ui";

export function Footer() {
  const lang = langFromPath(usePathname() || "/");
  const t = copyFor(lang);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          {t.footerNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
          <div className="badges">
            <img src="/media/mlqe.png" alt="MLQE" />
            <img src="/media/sdk.png" alt="Superdréckskëscht" />
          </div>
        </div>
        <div>
          <nav className="legal-links" aria-label={lang === "fr" ? "Mentions" : "Legal"}>
            {t.legal.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="socials">
            <a href="https://www.facebook.com/Pharmacie-Ginkgo-Apdikt-299438247515790/?ref=page_internal" target="_blank" rel="noopener noreferrer">
              <img src="/media/facebook-social-media.svg" alt="facebook" />
            </a>
            <a href="https://www.instagram.com/pharmacie_ginkgo_apdikt/" target="_blank" rel="noopener noreferrer">
              <img src="/media/instagram-transp-social-media.svg" alt="instagram" />
            </a>
          </div>
          <p className="copyright">© {year} Pharmacie Ginkgo</p>
        </div>
      </div>
    </footer>
  );
}
