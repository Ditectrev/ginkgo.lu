import Link from "next/link";
import { brandGroups, homeServiceImages } from "@/lib/brands";
import { imageAlt, stripHtml, type Block, type Page } from "@/lib/content";
import { copyFor } from "@/lib/ui";
import { BrandTabs } from "@/components/BrandTabs";
import { Html } from "@/components/Html";
import { Reveal } from "@/components/Reveal";

function assertShape(blocks: Block[]) {
  if (blocks.length < 47 || blocks[3]?.type !== "cta" || blocks[14]?.type !== "h2" || blocks[39]?.type !== "h2") {
    throw new Error("Homepage content shape does not match the live site.");
  }
}

export function HomePage({ page }: { page: Page }) {
  const blocks = page.blocks;
  assertShape(blocks);
  const t = copyFor(page.lang);
  const heroImage = page.images.find((image) => image.local.endsWith("ginkgo_270412_001.png"));
  const cards = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
    const start = 15 + index * 3;
    const heading = blocks[start];
    const text = blocks[start + 1];
    const cta = blocks[start + 2];
    if (!heading || !text || !cta || heading.type === "cta" || heading.type === "list" || text.type === "cta" || text.type === "list" || cta.type !== "cta") {
      throw new Error("Homepage service card is missing.");
    }
    const image = page.images.find((item) => item.local === homeServiceImages[index]);
    return { heading, text, cta, image };
  });
  const features = [
    { heading: blocks[8], text: blocks[9], icon: "/media/Icon-awesome-parking.svg", alt: "parking" },
    { heading: blocks[10], text: blocks[11], icon: "/media/flags.svg", alt: page.lang === "fr" ? "flags" : "flag" },
    { heading: blocks[12], text: blocks[13], icon: "/media/Icon-material-speaker-notes.svg", alt: "conseils" },
  ];
  const brandLabels = blocks.slice(41).map((block) => (block.type === "cta" || block.type === "list" ? "" : stripHtml(block.html)));

  return (
    <>
      <section className="wrap hero" id="accueil">
        <div>
          <Html as="h1" html={(blocks[0] as { html: string }).html} />
          <Html className="lede" html={(blocks[1] as { html: string }).html} />
          <Html html={(blocks[2] as { html: string }).html} />
          <div className="hero-actions">
            <Link className="btn" href={(blocks[3] as { href: string }).href}>
              {(blocks[3] as { label: string }).label}
            </Link>
          </div>
        </div>
        {heroImage ? (
          <div className="hero-photo">
            <img src={heroImage.local} alt={imageAlt(heroImage)} />
          </div>
        ) : null}
      </section>

      <section className="wrap section">
        <Reveal>
          <Html as="h2" html={(blocks[4] as { html: string }).html} />
          <div className="story">
            <Html html={(blocks[5] as { html: string }).html} />
            <Html html={(blocks[6] as { html: string }).html} />
            <Html html={(blocks[7] as { html: string }).html} />
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <div className="features">
          {features.map((feature) => {
            if (!feature.heading || !feature.text || feature.heading.type === "cta" || feature.heading.type === "list" || feature.text.type === "cta" || feature.text.type === "list") {
              return null;
            }
            return (
              <Reveal key={feature.heading.html}>
                <article className="feature">
                  <img className={feature.icon.includes("flags") ? "flags" : undefined} src={feature.icon} alt={feature.alt} />
                  <Html as="h3" html={feature.heading.html} />
                  <Html html={feature.text.html} />
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <Html as="h2" html={(blocks[14] as { html: string }).html} />
        <div className="cards">
          {cards.map((card) => (
            <Reveal key={card.cta.href}>
              <article className="card">
                {card.image ? <img src={card.image.local} alt={imageAlt(card.image)} /> : null}
                <Html as="h3" html={card.heading.html} />
                <Html html={card.text.html} />
                <Link className="cta" href={card.cta.href}>
                  {card.cta.label}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <Html as="h2" html={(blocks[39] as { html: string }).html} />
        <Html html={(blocks[40] as { html: string }).html} />
        <BrandTabs labels={brandLabels} groups={brandGroups} />
        <div className="quick-actions">
          <a className="btn secondary" href="https://www.pharmacie.lu/service-de-garde/" target="_blank" rel="noopener noreferrer">
            {t.onCall}
          </a>
          <Link className="btn" href={t.reserveHref}>
            {t.reserve}
          </Link>
        </div>
      </section>
    </>
  );
}
