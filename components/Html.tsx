import type { ElementType } from "react";

export function Html({
  html,
  as,
  className,
  id,
}: {
  html: string;
  as?: ElementType;
  className?: string;
  id?: string;
}) {
  const Tag = as ?? "div";
  return <Tag id={id} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
