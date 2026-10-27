import raw from "@/content/pages.json";

export type Lang = "fr" | "en";

export type Block =
  | { type: "h1" | "h2" | "h3" | "h4" | "h5" | "p" | "table"; html: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "cta"; label: string; href: string };

export type PageImage = { src: string; alt: string; local: string };

export type Page = {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  blocks: Block[];
  images: PageImage[];
};

type Data = {
  alternates: Record<string, string>;
  pages: Page[];
};

const data = raw as Data;

const byPath = new Map(data.pages.map((page) => [page.path, page]));

export function getPages(): Page[] {
  return data.pages;
}

export function getPage(path: string): Page | undefined {
  return byPath.get(path);
}

export function alternatePath(path: string): string {
  return data.alternates[path] ?? (path.startsWith("/en") ? "/" : "/en");
}

export function langFromPath(path: string): Lang {
  return path === "/en" || path.startsWith("/en/") ? "en" : "fr";
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const ALT_FALLBACK: Record<string, string> = {
  "/media/image003.png": "CeraVe",
  "/media/image002.png": "La Rosée",
  "/media/image005.png": "Puratopia",
  "/media/image006.png": "Klorane",
  "/media/image004.png": "Couleurs de Noir",
};

export function imageAlt(image: PageImage): string {
  const alt = image.alt.trim();
  if (alt) return alt;
  return ALT_FALLBACK[image.local] ?? "";
}

export type SearchEntry = {
  path: string;
  lang: Lang;
  title: string;
  text: string;
};

export function searchEntries(): SearchEntry[] {
  return data.pages.map((page) => {
    const bits = page.blocks.map((block) => {
      if (block.type === "list") return block.items.map(stripHtml).join(" ");
      if (block.type === "cta") return block.label;
      return stripHtml(block.html);
    });
    return {
      path: page.path,
      lang: page.lang,
      title: page.title,
      text: [page.title, page.description, ...bits].join(" "),
    };
  });
}
