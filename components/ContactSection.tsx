"use client";

import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";
import { langFromPath } from "@/lib/content";
import { copyFor } from "@/lib/ui";

const MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d323.1483976564199!2d6.116033310057089!3d49.61307572080993!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3c37d940accf1%3A0x182e6e6ac51915e6!2sPharmacie%20Ginkgo!5e0!3m2!1sde!2sde!4v1632736927708!5m2!1sde!2sde";

export function ContactSection() {
  const lang = langFromPath(usePathname() || "/");
  const t = copyFor(lang);
  const c = t.contact;
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "offline" | "failed">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const lastName = String(data.get("lastName") || "").trim();
    const firstName = String(data.get("firstName") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const nextErrors: Record<string, string> = {};
    if (!lastName) nextErrors.lastName = c.required;
    if (!firstName) nextErrors.firstName = c.required;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = email ? c.emailInvalid : c.required;
    if (!phone || !/^[+0-9().\s-]{6,40}$/.test(phone)) nextErrors.phone = phone ? c.phoneInvalid : c.required;
    if (!message) nextErrors.message = c.required;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName,
          firstName,
          email,
          phone,
          message,
          lang,
          company: String(data.get("company") || ""),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (payload.ok) {
        setStatus("ok");
        form.reset();
        return;
      }
      setStatus(payload.error === "not_configured" ? "offline" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div className="contact-card">
          <img className="madame" src="/media/Madame-Ginko.jpg" alt="madame ginkgo" />
          <p>{t.madame}</p>
          <p>
            {t.pharmacist}
            <br />
            {t.vat}
            <br />
            {t.street}
            <br />
            {t.city}
            <br />
            {t.stop}
          </p>
          <p>
            {t.mail} <a href="mailto:pharmacie@ginkgo.lu">pharmacie@ginkgo.lu</a>
            <br />
            {t.tel} <a href="tel:+352222174">+352 22 21 74</a>
          </p>
          <img className="wordmark" src="/media/new-logo-GINKGO-009.jpg" alt="pharmacie ginkgo" />
          <p>
            {t.connected}{" "}
            <a href="https://pharmacie.lu" target="_blank" rel="noopener noreferrer">
              Pharmacie.lu
            </a>
            <br />
            {t.guardQuestion}
            <br />
            <a href="https://pharmacie.lu" target="_blank" rel="noopener noreferrer">
              {t.guardLink}
            </a>
          </p>
        </div>
        <div className="form-card">
          <form className="fields" onSubmit={onSubmit} noValidate>
            <label>
              {c.lastName}
              <input name="lastName" type="text" autoComplete="family-name" aria-invalid={Boolean(errors.lastName)} />
              {errors.lastName ? <span className="error">{errors.lastName}</span> : null}
            </label>
            <label>
              {c.firstName}
              <input name="firstName" type="text" autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} />
              {errors.firstName ? <span className="error">{errors.firstName}</span> : null}
            </label>
            <label>
              {c.email}
              <input name="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} />
              {errors.email ? <span className="error">{errors.email}</span> : null}
            </label>
            <label>
              {c.phone}
              <input name="phone" type="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
              {errors.phone ? <span className="error">{errors.phone}</span> : null}
            </label>
            <label>
              {c.message}
              <textarea name="message" aria-invalid={Boolean(errors.message)} />
              {errors.message ? <span className="error">{errors.message}</span> : null}
            </label>
            <label className="hp" aria-hidden="true">
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
            <button className="btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? c.sending : c.submit}
            </button>
            {status === "ok" ? <p className="status" role="status">{c.success}</p> : null}
            {status === "offline" ? <p className="status" role="alert">{c.offline}</p> : null}
            {status === "failed" ? <p className="status" role="alert">{c.failed}</p> : null}
          </form>
          <iframe className="map" title="Pharmacie Ginkgo" src={MAP} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </section>
  );
}
