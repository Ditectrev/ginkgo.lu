import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/components/ArticlePage";
import { HomePage } from "@/components/HomePage";
import { PrescriptionForm } from "@/components/PrescriptionForm";
import { ServicesPage } from "@/components/ServicesPage";
import { Html } from "@/components/Html";
import { alternatePath, getPage, getPages } from "@/lib/content";

type Params = { slug?: string[] };

function pathFromSlug(slug?: string[]) {
  if (!slug || slug.length === 0) return "/";
  return `/${slug.join("/")}`;
}

export function generateStaticParams(): Params[] {
  return getPages().map((page) => ({
    slug: page.path === "/" ? [] : page.path.split("/").filter(Boolean),
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const page = getPage(path);
  if (!page) return { title: "Page not found - GinkGo" };
  const other = alternatePath(path);
  const fr = page.lang === "fr" ? path : other;
  const en = page.lang === "en" ? path : other;
  return {
    title: page.title,
    description: page.description || undefined,
    alternates: {
      canonical: path,
      languages: { fr, en },
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const path = pathFromSlug(slug);
  const page = getPage(path);
  if (!page) notFound();

  if (path === "/" || path === "/en") return <HomePage page={page} />;
  if (path === "/services" || path === "/en/services") return <ServicesPage page={page} />;
  if (path === "/envoyez-votre-prescription" || path === "/en/send-your-prescription") {
    const title = page.blocks.find((block) => block.type === "h1");
    return (
      <article className="wrap">
        <header className="page-hero">
          {title && title.type !== "cta" && title.type !== "list" ? <Html as="h1" html={title.html} /> : null}
        </header>
        <div className="article solo">
          <PrescriptionForm lang={page.lang} blocks={page.blocks} />
        </div>
      </article>
    );
  }

  return <ArticlePage page={page} />;
}
