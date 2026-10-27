"use client";

import { FormEvent, useMemo, useState } from "react";
import { stripHtml, type Block, type Lang } from "@/lib/content";
import { copyFor } from "@/lib/ui";

const MAX_TOTAL = 10 * 1024 * 1024;
const ALLOWED = new Set(["jpg", "jpeg", "png", "pdf"]);

function ext(name: string) {
  return name.toLowerCase().split(".").pop() || "";
}

export function PrescriptionForm({ lang, blocks }: { lang: Lang; blocks: Block[] }) {
  const t = copyFor(lang).prescription;
  const paragraphs = blocks
    .filter((block) => block.type === "p")
    .map((block) => stripHtml("html" in block ? block.html : ""))
    .filter((text) => text && text !== "❌");

  const labels = paragraphs.slice(0, 5);
  const hint = paragraphs[5] || "";
  const messageLabel = paragraphs[6] || "";
  const consent = paragraphs[7] || "";
  const termsLabel = paragraphs[8] || "";
  const thanks = paragraphs[9] || "";

  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "offline" | "failed">("idle");
  const [error, setError] = useState("");

  const total = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((current) => [...current, ...Array.from(list)].slice(0, 8));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = String(data.get("firstName") || "").trim();
    const lastName = String(data.get("lastName") || "").trim();
    const email = String(data.get("email") || "").trim();
    const birthday = String(data.get("birthday") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const message = String(data.get("message") || "").trim();
    const terms = data.get("terms") === "yes";

    if (!firstName || !lastName || !birthday || !email || !phone) {
      setError(copyFor(lang).contact.required);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(copyFor(lang).contact.emailInvalid);
      return;
    }
    if (!/^[+0-9().\s-]{6,40}$/.test(phone)) {
      setError(copyFor(lang).contact.phoneInvalid);
      return;
    }
    if (!message && files.length === 0) {
      setError(t.needOne);
      return;
    }
    if (files.some((file) => !ALLOWED.has(ext(file.name)))) {
      setError(t.badType);
      return;
    }
    if (total > MAX_TOTAL) {
      setError(t.tooBig);
      return;
    }
    if (!terms) {
      setError(t.terms);
      return;
    }

    const body = new FormData();
    body.set("firstName", firstName);
    body.set("lastName", lastName);
    body.set("email", email);
    body.set("birthday", birthday);
    body.set("phone", phone);
    body.set("message", message);
    body.set("terms", "yes");
    body.set("lang", lang);
    body.set("company", String(data.get("company") || ""));
    files.forEach((file) => body.append("files", file));

    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/prescription", { method: "POST", body });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (payload.ok) {
        setStatus("ok");
        setFiles([]);
        form.reset();
        return;
      }
      if (payload.error === "not_configured") setStatus("offline");
      else if (payload.error === "bad_type") setError(t.badType);
      else if (payload.error === "too_big") setError(t.tooBig);
      else if (payload.error === "need_one") setError(t.needOne);
      else setStatus("failed");
      if (payload.error === "bad_type" || payload.error === "too_big" || payload.error === "need_one") {
        setStatus("idle");
      }
    } catch {
      setStatus("failed");
    }
  }

  const [first = "", last = "", email = "", birthday = "", phone = ""] = labels;

  return (
    <form className="fields" onSubmit={onSubmit} noValidate>
      <label>
        {first}
        <input name="firstName" type="text" autoComplete="given-name" required />
      </label>
      <label>
        {last}
        <input name="lastName" type="text" autoComplete="family-name" required />
      </label>
      <label>
        {email}
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        {birthday}
        <input name="birthday" type="text" autoComplete="bday" required />
      </label>
      <label>
        {phone}
        <input name="phone" type="tel" autoComplete="tel" required />
      </label>
      <p className="hint">{hint}</p>
      <div>
        <label className="file-btn">
          {t.upload}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            multiple
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <ul className="file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <span>{file.name}</span>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setFiles((current) => current.filter((_, item) => item !== index))}
              >
                <span aria-hidden="true">❌</span>
                <span className="hp">{t.remove}</span>
              </button>
            </li>
          ))}
        </ul>
        <small className="hint">
          {t.fileHint} <span className="warn">{t.fileLimit}</span>
        </small>
      </div>
      <label>
        {messageLabel}
        <textarea name="message" />
      </label>
      <p className="hint">{consent}</p>
      <label className="check">
        <input name="terms" type="checkbox" value="yes" />
        <span>{termsLabel}</span>
      </label>
      <p className="hint">{thanks}</p>
      <label className="hp" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      {error ? <p className="error" role="alert">{error}</p> : null}
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? t.sending : lang === "fr" ? "Envoyer" : "Send"}
      </button>
      {status === "ok" ? <p className="status" role="status">{thanks}</p> : null}
      {status === "offline" ? <p className="status" role="alert">{t.offline}</p> : null}
      {status === "failed" ? <p className="status" role="alert">{t.failed}</p> : null}
    </form>
  );
}
