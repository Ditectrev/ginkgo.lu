import type { ReactNode } from "react";
import Link from "next/link";
import { imageAlt, stripHtml, type Block, type Page, type PageImage } from "@/lib/content";
import { HistoryTimeline, type HistoryItem } from "@/components/HistoryTimeline";
import { Html } from "@/components/Html";

const TIMELINE_FILES = new Set([
  "Path-45.png",
  "Group-175.png",
  "Group-176.png",
  "Group-177.png",
  "Group-178.png",
  "Group-179.png",
  "Group-180.png",
]);

function isTimelineImage(image: PageImage) {
  return TIMELINE_FILES.has(image.local.split("/").pop() ?? "");
}

function headingId(html: string) {
  const text = stripHtml(html).toLowerCase();
  if (text.includes("au fil du temps") || text.includes("over the years")) return "history";
  return undefined;
}

function renderBlocks(blocks: Block[]) {
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

  return nodes;
}

export function ArticlePage({ page }: { page: Page }) {
  const blocks = page.blocks.filter((block, index) => !(index === 0 && block.type === "h1"));
  const title = page.blocks.find((block) => block.type === "h1");
  const contentImages = page.images.filter((image) => !isTimelineImage(image));
  const [featured, ...gallery] = contentImages;
  const historyIndex = blocks.findIndex((block) => "html" in block && headingId(block.html) === "history");
  const proseBlocks = historyIndex === -1 ? blocks : blocks.slice(0, historyIndex);
  const historyBlocks = historyIndex === -1 ? [] : blocks.slice(historyIndex);
  const historyHeading = historyBlocks[0];
  const historyItems: HistoryItem[] = [];
  let afterHistory = 0;
  for (let index = 1; index < historyBlocks.length; index += 1) {
    const block = historyBlocks[index];
    if (block.type !== "h5") {
      afterHistory = index;
      break;
    }
    const paras: string[] = [];
    index += 1;
    while (index < historyBlocks.length && historyBlocks[index]?.type === "p") {
      const para = historyBlocks[index];
      if (!para || !("html" in para)) break;
      if (/copyright/i.test(stripHtml(para.html))) break;
      paras.push(para.html);
      index += 1;
    }
    index -= 1;
    if ("html" in block) historyItems.push({ year: block.html, paras });
    afterHistory = index + 1;
  }
  const trailing = historyBlocks.slice(afterHistory);

  return (
    <article className="wrap">
      <header className="page-hero">
        {title && title.type !== "cta" && title.type !== "list" ? <Html as="h1" html={title.html} /> : null}
      </header>
      <div className={featured ? "article" : "article solo"}>
        <div className="prose">{renderBlocks(proseBlocks)}</div>
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
      {historyHeading && "html" in historyHeading ? (
        <section className="history-section" id="history" aria-labelledby="history-title">
          <Html as="h2" id="history-title" html={historyHeading.html} />
          <HistoryTimeline items={historyItems} images={page.images} />
          {trailing.some((block) => "html" in block && /copyright/i.test(stripHtml(block.html))) ? (
            <div className="history-credit">{renderBlocks(trailing)}</div>
          ) : (
            renderBlocks(trailing)
          )}
        </section>
      ) : null}
    </article>
  );
}
