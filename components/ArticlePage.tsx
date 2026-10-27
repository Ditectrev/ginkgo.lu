import type { ReactNode } from "react";
import Link from "next/link";
import { imageAlt, stripHtml, type Block, type Page } from "@/lib/content";
import { Html } from "@/components/Html";

function headingId(html: string) {
  const text = stripHtml(html).toLowerCase();
  if (text.includes("au fil du temps") || text.includes("over the years")) return "history";
  return undefined;
}

export function ArticlePage({ page }: { page: Page }) {
  const blocks = page.blocks.filter((block, index) => !(index === 0 && block.type === "h1"));
  const title = page.blocks.find((block) => block.type === "h1");
  const [featured, ...gallery] = page.images;
  const nodes: ReactNode[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type === "h5") {
      const items: { year: string; paras: string[] }[] = [];
      while (index < blocks.length && blocks[index]?.type === "h5") {
        const year = blocks[index] as Extract<Block, { html: string }>;
        index += 1;
        const paras: string[] = [];
        while (index < blocks.length && blocks[index]?.type === "p") {
          paras.push((blocks[index] as Extract<Block, { html: string }>).html);
          index += 1;
        }
        items.push({ year: year.html, paras });
      }
      index -= 1;
      nodes.push(
        <ol className="timeline" key={`time-${items[0]?.year}`}>
          {items.map((item) => (
            <li key={item.year}>
              <Html as="strong" html={item.year} />
              <div>
                {item.paras.map((html) => (
                  <Html as="p" key={html} html={html} />
                ))}
              </div>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (block.type === "cta") {
      const external = block.href.startsWith("http");
      nodes.push(
        external ? (
          <a key={`${block.href}-${block.label}`} className="cta" href={block.href} target="_blank" rel="noopener noreferrer">
            {block.label}
          </a>
        ) : (
          <Link key={`${block.href}-${block.label}`} className="cta" href={block.href}>
            {block.label}
          </Link>
        ),
      );
      continue;
    }

    if (block.type === "list") {
      const Tag = block.ordered ? "ol" : "ul";
      nodes.push(
        <Tag key={`list-${index}`}>
          {block.items.map((item) => (
            <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </Tag>,
      );
      continue;
    }

    if (block.type === "table") {
      nodes.push(<Html key={`table-${index}`} html={block.html} />);
      continue;
    }

    const tag = block.type === "p" ? "p" : block.type;
    nodes.push(<Html key={`${block.type}-${index}`} as={tag} id={headingId(block.html)} html={block.html} />);
  }

  return (
    <article className="wrap">
      <header className="page-hero">
        {title && title.type !== "cta" && title.type !== "list" ? <Html as="h1" html={title.html} /> : null}
      </header>
      <div className={featured ? "article" : "article solo"}>
        <div className="prose">{nodes}</div>
        {featured ? (
          <aside>
            <img className="feature-photo" src={featured.local} alt={imageAlt(featured)} />
            {gallery.length ? (
              <div className="gallery">
                {gallery.map((image) => (
                  <a key={image.local + image.alt} href={image.local} target="_blank" rel="noopener noreferrer">
                    <img src={image.local} alt={imageAlt(image)} />
                  </a>
                ))}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>
    </article>
  );
}
