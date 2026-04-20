import type { SiteItem } from "../domain/models/site";

interface SiteCardProps {
  site: SiteItem;
}

export function SiteCard({ site }: SiteCardProps) {
  return (
    <article className="card">
      <div className="card-head">
        <div className="site-icon blue">◎</div>
        <div className="card-actions">
          <span>⚙</span>
          <span>×</span>
        </div>
      </div>
      <h3>{site.title}</h3>
      <p>{site.note || "暂无备注"}</p>
      <span className="tag">{site.categories[0] ?? "其他"}</span>
    </article>
  );
}
