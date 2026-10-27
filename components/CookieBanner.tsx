"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { langFromPath } from "@/lib/content";
import { copyFor } from "@/lib/ui";

const GA_ID = "G-K80J2W37P7";
const STORAGE_KEY = "ginkgo-consent";

type Consent = { necessary: true; analytics: boolean };

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    return { necessary: true, analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
}

export function CookieBanner() {
  const lang = langFromPath(usePathname() || "/");
  const t = copyFor(lang);
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<Consent | null>(null);
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("has-cookie", ready && !consent);
  }, [ready, consent]);

  useEffect(() => {
    const stored = readConsent();
    setConsent(stored);
    setAnalytics(Boolean(stored?.analytics));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!consent?.analytics) return;
    if (document.querySelector(`script[data-ga="${GA_ID}"]`)) return;
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    script.async = true;
    script.dataset.ga = GA_ID;
    document.head.appendChild(script);
    const inline = document.createElement("script");
    inline.dataset.ga = `${GA_ID}-config`;
    inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`;
    document.head.appendChild(inline);
  }, [consent]);

  function save(next: Consent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setConsent(next);
    setAnalytics(next.analytics);
    setOpen(false);
  }

  if (!ready) return null;
  const policy = lang === "fr" ? "/politique-en-matiere-de-cookies" : "/en/cookie-policy";

  return (
    <>
      {!consent ? (
        <div className="cookie" role="dialog" aria-label={t.cookieSettings}>
          <p>{t.cookieText}</p>
          <div className="cookie-actions">
            <button className="btn secondary" type="button" onClick={() => setOpen(true)}>
              {t.cookieSettings}
            </button>
            <button className="btn" type="button" onClick={() => save({ necessary: true, analytics: true })}>
              {t.cookieAccept}
            </button>
          </div>
        </div>
      ) : (
        <button className="manage" type="button" onClick={() => setOpen(true)}>
          {t.cookieManage}
        </button>
      )}
      {open ? (
        <div className="modal-back" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-labelledby="cookie-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="btn secondary" type="button" onClick={() => setOpen(false)}>
              {t.cookieClose}
            </button>
            <h2 id="cookie-title">{t.cookieOverviewTitle}</h2>
            <p>{t.cookieOverview}</p>
            <div className="cookie-cat">
              <div>
                <strong>{t.cookieNecessary}</strong>
                <p>{t.cookieNecessaryBody}</p>
              </div>
              <span>{t.cookieAlways}</span>
            </div>
            <div className="cookie-cat">
              <div>
                <strong>{t.cookieAnalytics}</strong>
                <p>{t.cookieAnalyticsBody}</p>
              </div>
              <label>
                <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
              </label>
            </div>
            <p>
              <Link href={policy}>{t.cookiePolicy}</Link>
            </p>
            <div className="cookie-actions">
              <button className="btn secondary" type="button" onClick={() => save({ necessary: true, analytics })}>
                {t.cookieSave}
              </button>
              <button className="btn" type="button" onClick={() => save({ necessary: true, analytics: true })}>
                {t.cookieAccept}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
