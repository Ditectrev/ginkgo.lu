import type { MetadataRoute } from "next";
import { alternatePath, getPages } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPages().map((page) => {
    const other = alternatePath(page.path);
    const fr = page.lang === "fr" ? page.path : other;
    const en = page.lang === "en" ? page.path : other;
    return {
      url: absoluteUrl(page.path),
      alternates: {
        languages: {
          fr: absoluteUrl(fr),
          en: absoluteUrl(en),
          "x-default": absoluteUrl(fr),
        },
      },
    };
  });
}
