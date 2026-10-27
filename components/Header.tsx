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
        <div className="search-dialog" role="dialog" aria-label={t.searchOpen}>
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

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 16l5 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
