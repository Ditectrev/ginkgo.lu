const configured = process.env.NEXT_PUBLIC_SITE_URL || "https://ginkgo.lu";

export const siteUrl = configured.replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return new URL(path, `${siteUrl}/`).toString();
}
