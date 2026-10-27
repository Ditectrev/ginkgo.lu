import type { MetadataRoute } from "next";
import { alternatePath, getPages } from "@/lib/content";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ginkgo.lu";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPages().map((page) => {
    const other = alternatePath(page.path);
    const fr = page.lang === "fr" ? page.path : other;
    const en = page.lang === "en" ? page.path : other;
    return {
      url: new URL(page.path, base).toString(),
      alternates: {
        languages: {
          fr: new URL(fr, base).toString(),
          en: new URL(en, base).toString(),
        },
      },
    };
  });
}
