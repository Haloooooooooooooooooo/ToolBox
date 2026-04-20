interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onSelect
}: CategoryNavProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-label">Nav</div>
      {categories.map((category) => (
        <button
          key={category}
          className={`nav-item ${activeCategory === category ? "active" : ""}`}
          onClick={() => onSelect(category)}
          type="button"
        >
          <span className="nav-icon">{iconForCategory(category)}</span>
          <small>{category}</small>
        </button>
      ))}
      <button className="nav-item add" type="button">
        +
      </button>
    </aside>
  );
}

function iconForCategory(category: string) {
  switch (category) {
    case "全部":
      return "▦";
    case "开发":
      return "</>";
    case "UI":
      return "◔";
    case "笔记":
      return "☰";
    default:
      return "•••";
  }
}
