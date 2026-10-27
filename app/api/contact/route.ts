import { sendMail } from "@/lib/mail";
import { clean, validEmail, validPhone } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  if (clean(data.company, 200)) {
    return Response.json({ ok: true });
  }

  const lastName = clean(data.lastName, 120);
  const firstName = clean(data.firstName, 120);
  const email = clean(data.email, 200);
  const phone = clean(data.phone, 40);
  const message = clean(data.message, 5000);
  const lang = data.lang === "en" ? "en" : "fr";

  if (!lastName || !firstName || !message || !validEmail(email) || !validPhone(phone)) {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const result = await sendMail({
    subject: `[ginkgo.lu] ${lang === "fr" ? "Message" : "Message"} — ${firstName} ${lastName}`,
    replyTo: email,
    text: [
      `Lang: ${lang}`,
      `Nom / Last name: ${lastName}`,
      `Prénom / First name: ${firstName}`,
      `Email: ${email}`,
      `Tél: ${phone}`,
      "",
      message,
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
