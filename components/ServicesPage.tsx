import Link from "next/link";
import { imageAlt, stripHtml, type Block, type Page } from "@/lib/content";
import { Html } from "@/components/Html";
import { Reveal } from "@/components/Reveal";

export function ServicesPage({ page }: { page: Page }) {
  const title = page.blocks[0];
  const cards: { heading: Extract<Block, { html: string }>; text: Extract<Block, { html: string }>; cta: Extract<Block, { type: "cta" }>; image?: Page["images"][number] }[] = [];
  for (let index = 1; index < page.blocks.length; index += 3) {
    const heading = page.blocks[index];
    const text = page.blocks[index + 1];
    const cta = page.blocks[index + 2];
    if (!heading || !text || !cta || heading.type === "cta" || heading.type === "list" || text.type === "cta" || text.type === "list" || cta.type !== "cta") {
      continue;
    }
    cards.push({ heading, text, cta, image: page.images[cards.length] });
  }

  return (
    <section className="wrap section">
      {title && title.type !== "cta" && title.type !== "list" ? <Html as="h1" html={title.html} /> : null}
      <div className="cards">
        {cards.map((card) => (
          <Reveal key={card.cta.href}>
            <article className="card">
              {card.image ? <img src={card.image.local} alt={imageAlt(card.image) || stripHtml(card.heading.html)} /> : null}
              <Html as="h2" html={card.heading.html} />
              <Html html={card.text.html} />
              <Link className="cta" href={card.cta.href}>
                {card.cta.label}
              </Link>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
