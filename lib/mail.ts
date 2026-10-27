export type OutboundMail = {
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
};

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "send_failed" };

export async function sendMail(mail: OutboundMail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  const to = process.env.CONTACT_TO || "pharmacie@ginkgo.lu";

  if (!apiKey || !from) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: mail.subject,
        text: mail.text,
        reply_to: mail.replyTo,
        attachments: mail.attachments,
      }),
    });

    if (!response.ok) {
      console.error("Resend rejected the message", response.status);
      return { ok: false, reason: "send_failed" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Resend request failed", error instanceof Error ? error.message : "unknown");
    return { ok: false, reason: "send_failed" };
  }
}
