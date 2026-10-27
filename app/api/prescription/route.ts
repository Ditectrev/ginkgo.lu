import { sendMail } from "@/lib/mail";
import {
  ALLOWED_EXT,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  clean,
  fileExtension,
  validEmail,
  validPhone,
} from "@/lib/validate";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  if (clean(form.get("company"), 200)) {
    return Response.json({ ok: true });
  }

  const firstName = clean(form.get("firstName"), 120);
  const lastName = clean(form.get("lastName"), 120);
  const email = clean(form.get("email"), 200);
  const birthday = clean(form.get("birthday"), 40);
  const phone = clean(form.get("phone"), 40);
  const message = clean(form.get("message"), 5000);
  const terms = form.get("terms") === "yes";
  const lang = form.get("lang") === "en" ? "en" : "fr";

  if (
    !firstName ||
    !lastName ||
    !birthday ||
    !terms ||
    !validEmail(email) ||
    !validPhone(phone)
  ) {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const files = form
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (!message && files.length === 0) {
    return Response.json({ ok: false, error: "need_one" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return Response.json({ ok: false, error: "too_big" }, { status: 400 });
  }

  let total = 0;
  const attachments: { filename: string; content: string }[] = [];
  for (const file of files) {
    const ext = fileExtension(file.name);
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json({ ok: false, error: "bad_type" }, { status: 400 });
    }
    total += file.size;
    if (total > MAX_TOTAL_BYTES) {
      return Response.json({ ok: false, error: "too_big" }, { status: 400 });
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const safe = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 80) || `fichier.${ext}`;
    attachments.push({ filename: safe, content: bytes.toString("base64") });
  }

  const result = await sendMail({
    subject: `[ginkgo.lu] ${lang === "fr" ? "Prescription" : "Prescription"} — ${firstName} ${lastName}`,
    replyTo: email,
    attachments,
    text: [
      `Lang: ${lang}`,
      `Prénom / First name: ${firstName}`,
      `Nom / Last name: ${lastName}`,
      `Email: ${email}`,
      `Date de naissance / Date of birth: ${birthday}`,
      `Tél: ${phone}`,
      `Fichiers: ${attachments.map((file) => file.filename).join(", ") || "—"}`,
      "",
      message || "—",
    ].join("\n"),
  });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: result.reason },
      { status: result.reason === "not_configured" ? 503 : 502 },
    );
  }

  return Response.json({ ok: true });
}
