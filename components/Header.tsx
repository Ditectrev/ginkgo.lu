"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { alternatePath, langFromPath, searchEntries, stripHtml, type Lang } from "@/lib/content";
import { copyFor } from "@/lib/ui";

export function SkipLink() {
  const lang = langFromPath(usePathname() || "/");
  return (
    <a className="skip" href="#contenu">
      {copyFor(lang).skip}
    </a>
  );
}

export function LangAttr() {
  const path = usePathname() || "/";
  useEffect(() => {
    document.documentElement.lang = langFromPath(path);
  }, [path]);
  return null;
}

export function Header() {
  const pathname = usePathname() || "/";
  const lang: Lang = langFromPath(pathname);
  const t = copyFor(lang);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return searchEntries()
      .filter((entry) => entry.lang === lang && entry.text.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, lang]);

  const frenchPath = lang === "fr" ? pathname : alternatePath(pathname);
  const englishPath = lang === "en" ? pathname : alternatePath(pathname);

  return (
    <header className="site-header">
      <div className="wrap">
        <div className="topbar">
          <a className="phone" href="tel:+352222174">
            {t.phoneLabel}
          </a>
          <details className="hours">
            <summary>{t.hoursTitle}</summary>
            <div className="hours-panel">
              {t.hours.map(([day, time]) => (
                <div key={day}>
                  <span>{day}</span>
                  <strong>{time}</strong>
                </div>
              ))}
            </div>
          </details>
          <div className="top-actions">
            <ThemeToggle label={t.theme} light={t.themeLight} dark={t.themeDark} />
            <button className="icon-btn" type="button" aria-label={t.searchOpen} onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </button>
            <Link className="lang-link" href={frenchPath} hrefLang="fr" aria-current={lang === "fr" ? "true" : undefined} aria-label="Français">
              FR
            </Link>
            <Link className="lang-link" href={englishPath} hrefLang="en" aria-current={lang === "en" ? "true" : undefined} aria-label="Anglais">
              EN
            </Link>
          </div>
        </div>
        <div className="navrow">
          <Link className="brand" href={t.home}>
            <img src="/media/logo.jpg" alt="Pharmacie Ginkgo" />
          </Link>
          <button
            className="icon-btn burger"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t.menuClose : t.menu}
          </button>
          <nav id="site-nav" className={open ? "nav open" : "nav"} aria-label={lang === "fr" ? "Principal" : "Main"}>
            {t.nav.map((item) =>
              "children" in item && item.children ? (
                <div className={servicesOpen ? "has-sub open" : "has-sub"} key={item.href}>
                  <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                    {item.label}
                  </Link>
                  <button
                    className="sub-toggle"
                    type="button"
                    aria-expanded={servicesOpen}
                    aria-label={item.label}
                    onClick={() => setServicesOpen((value) => !value)}
                  >
                    ▾
                  </button>
                  <div className="sub">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href} aria-current={pathname === child.href ? "page" : undefined}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
      {searchOpen ? (
        <div
          className="search-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={t.searchOpen}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSearchOpen(false);
          }}
        >
          <div className="search-panel">
            <input
              autoFocus
              placeholder={t.search}
              aria-label={t.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <ul className="search-results">
              {query.trim().length >= 2 && results.length === 0 ? <li>{t.searchEmpty}</li> : null}
              {results.map((entry) => (
                <li key={entry.path}>
                  <Link href={entry.path} onClick={() => setSearchOpen(false)}>
                    {entry.title}
                    <small>{stripHtml(entry.text).slice(0, 140)}</small>
                  </Link>
                </li>
              ))}
            </ul>
            <button className="btn secondary" type="button" onClick={() => setSearchOpen(false)}>
              {t.searchClose}
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function ThemeToggle({ label, light, dark }: { label: string; light: string; dark: string }) {
  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-theme")) return;
    try {
      const stored = localStorage.getItem("ginkgo-theme");
      root.setAttribute("data-theme", stored === "light" || stored === "dark" ? stored : "system");
    } catch {
      root.setAttribute("data-theme", "system");
    }
  }, []);

  function toggle() {
    const root = document.documentElement;
    const choice = root.getAttribute("data-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedDark = choice === "dark" || ((choice === "system" || !choice) && systemDark);
    const next = resolvedDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("ginkgo-theme", next);
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <button className="icon-btn theme-btn" type="button" onClick={toggle}>
      <SunIcon className="when-light" />
      <MoonIcon className="when-dark" />
      <span className="sr">{label}</span>
      <span className="when-light">{light}</span>
      <span className="when-dark">{dark}</span>
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
