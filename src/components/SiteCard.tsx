import type { MouseEvent } from "react";
import type { SiteItem } from "../domain/models/site";

interface SiteCardProps {
  site: SiteItem;
  onOpen: (site: SiteItem) => void;
  onDelete: (site: SiteItem) => void;
  onEdit: (site: SiteItem) => void;
}

const iconMap: Record<string, string> = {
  GitHub: "◉",
  Figma: "✎",
  Notion: "▣",
  Medium: "▤"
};

export function SiteCard({ site, onOpen, onDelete, onEdit }: SiteCardProps) {
  function preventCardOpen(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  return (
    <article
      className="card clickable-card"
      onClick={() => onOpen(site)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(site);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="card-head">
        <div className="site-icon blue">{iconMap[site.title] ?? "◉"}</div>
        <div className="card-actions">
          <button
            aria-label={`编辑 ${site.title}`}
            className="icon-button"
            onClick={(event) => {
              preventCardOpen(event);
              onEdit(site);
            }}
            type="button"
          >
            ⚙
          </button>
          <button
            aria-label={`删除 ${site.title}`}
            className="icon-button"
            onClick={(event) => {
              preventCardOpen(event);
              onDelete(site);
            }}
            type="button"
          >
            ×
          </button>
        </div>
      </div>
      <h3>{site.title}</h3>
      <p>{site.note || "暂无备注"}</p>
      <span className="tag">{site.categories[0] ?? "其他"}</span>
    </article>
  );
}
