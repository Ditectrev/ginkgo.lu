import { stripHtml, type PageImage } from "@/lib/content";
import { Html } from "@/components/Html";

export type HistoryItem = { year: string; paras: string[] };

const PHOTO_BY_SLOT = {
  now: "ginkgo 2021",
  war: "ginkgo 1940-1945",
  move1953: "ginkgo 1953",
  y1915: "ginkgo 1915",
  y1898: "ginkgo 1898",
  y1906: "ginkgo 1906",
} as const;

export function HistoryTimeline({ items, images }: { items: HistoryItem[]; images: PageImage[] }) {
  const byYear = new Map(items.map((item) => [stripHtml(item.year), item]));
  const byAlt = new Map(images.map((image) => [image.alt, image]));
  const path = images.find((image) => image.local.endsWith("/Path-45.png"));

  function card(year: string, className?: string) {
    const item = byYear.get(year);
    if (!item) return null;
    return (
      <div className={className ? `history-card ${className}` : "history-card"}>
        <Html as="strong" html={item.year} />
        {item.paras.map((html) => (
          <Html as="p" key={html} html={html} />
        ))}
      </div>
    );
  }

  function photo(alt: string) {
    const image = byAlt.get(alt);
    if (!image) return null;
    return (
      <a className="history-photo" href={image.local} target="_blank" rel="noopener noreferrer">
        <img src={image.local} alt={image.alt} />
      </a>
    );
  }

  return (
    <div className="history-board">
      {path ? <img className="history-path" src={path.local} alt="" /> : null}
      <div className="history-row years-top">
        {photo(PHOTO_BY_SLOT.now)}
        {card("2009", "shift-mid")}
        {card("2007", "shift-low")}
      </div>
      <div className="history-row year-mid">
        {photo(PHOTO_BY_SLOT.war)}
        {photo(PHOTO_BY_SLOT.move1953)}
        {card("1953", "shift-mid")}
      </div>
      <div className="history-row years-photo">
        {card("1933")}
        {card("1921")}
        {photo(PHOTO_BY_SLOT.y1915)}
      </div>
      <div className="history-row photo-year-photo">
        {photo(PHOTO_BY_SLOT.y1898)}
        {card("1899", "shift-mid")}
        {photo(PHOTO_BY_SLOT.y1906)}
      </div>
      <div className="history-row years-only">
        {card("1872")}
        {card("1871", "shift-up")}
        {card("1832")}
        {card("1803", "shift-low")}
      </div>
    </div>
  );
}
