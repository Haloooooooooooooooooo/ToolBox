import { useEffect, useMemo, useState } from "react";
import { AddSiteDialog } from "../../components/AddSiteDialog";
import { CategoryNav } from "../../components/CategoryNav";
import { SiteCard } from "../../components/SiteCard";
import type { SiteItem } from "../../domain/models/site";
import { querySites } from "../../application/use-cases/query-sites";
import "./popup.css";

const defaultSites: SiteItem[] = [
  {
    id: "1",
    title: "GitHub",
    url: "https://github.com",
    normalizedUrl: "https://github.com/",
    categories: ["开发"],
    note: "Development workflow and source code hosting.",
    createdAt: Date.now(),
    lastOpenedAt: Date.now()
  },
  {
    id: "2",
    title: "Figma",
    url: "https://figma.com",
    normalizedUrl: "https://figma.com/",
    categories: ["UI"],
    note: "Collaborative interface design tool.",
    createdAt: Date.now(),
    lastOpenedAt: Date.now() - 1
  },
  {
    id: "3",
    title: "Notion",
    url: "https://notion.so",
    normalizedUrl: "https://notion.so/",
    categories: ["笔记"],
    note: "All-in-one workspace for notes.",
    createdAt: Date.now(),
    lastOpenedAt: Date.now() - 2
  },
  {
    id: "4",
    title: "Medium",
    url: "https://medium.com",
    normalizedUrl: "https://medium.com/",
    categories: ["其他"],
    note: "Interesting stories and tech articles.",
    createdAt: Date.now(),
    lastOpenedAt: Date.now() - 3
  }
];

export function PopupApp() {
  const [sites, setSites] = useState<SiteItem[]>(defaultSites);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void querySites()
      .then((loadedSites) => {
        if (loadedSites.length > 0) {
          setSites(loadedSites);
        }
      })
      .catch(() => {
        setSites(defaultSites);
      });
  }, []);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesCategory =
        activeCategory === "全部" || site.categories.includes(activeCategory);
      const keyword = search.trim().toLowerCase();
      const matchesKeyword =
        keyword.length === 0 ||
        site.title.toLowerCase().includes(keyword) ||
        site.note.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [activeCategory, search, sites]);

  return (
    <>
      <div className="app-shell">
        <header className="topbar">
          <h1 className="brand">PinBase</h1>
          <label className="search">
            <input
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索网站..."
              type="text"
              value={search}
            />
            <span className="icon">⌕</span>
          </label>
        </header>

        <section className="hero">
          <button className="cta" onClick={() => setDialogOpen(true)} type="button">
            <span className="plus">+</span>
            添加当前网站
          </button>
        </section>

        <div className="content">
          <CategoryNav
            activeCategory={activeCategory}
            categories={["全部", "开发", "UI", "笔记", "其他"]}
            onSelect={setActiveCategory}
          />

          <main className="main">
            <div className="section-head">
              <h2>Pinned Boards</h2>
              <span>{filteredSites.length} Items</span>
            </div>

            <div className="grid">
              {filteredSites.map((site) => (
                <SiteCard key={site.id} site={site} />
              ))}
            </div>
          </main>
        </div>
      </div>

      <AddSiteDialog onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </>
  );
}
