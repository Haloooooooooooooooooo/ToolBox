import { useEffect, useState } from "react";

interface ContextMenuState {
  category: string;
  x: number;
  y: number;
}

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  onAddCategory: () => void;
  onRenameCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  manageableCategories: string[];
}

export function CategoryNav({
  categories,
  activeCategory,
  onSelect,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  manageableCategories
}: CategoryNavProps) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    function closeMenu() {
      setMenu(null);
    }

    window.addEventListener("click", closeMenu);
    window.addEventListener("blur", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("blur", closeMenu);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-label">Nav</div>

      {categories.map((category) => {
        const manageable = manageableCategories.includes(category);

        return (
          <button
            key={category}
            className={`nav-item ${activeCategory === category ? "active" : ""}`}
            onClick={() => onSelect(category)}
            onContextMenu={(event) => {
              if (!manageable) return;
              event.preventDefault();
              setMenu({
                category,
                x: event.clientX,
                y: event.clientY
              });
            }}
            title={manageable ? "右键可重命名或删除" : undefined}
            type="button"
          >
            <span className="nav-icon">{iconForCategory(category)}</span>
            <small>{category}</small>
          </button>
        );
      })}

      <button className="nav-item add" onClick={onAddCategory} type="button">
        +
      </button>

      {menu ? (
        <div
          className="category-context-menu"
          onClick={(event) => event.stopPropagation()}
          style={{
            left: `${menu.x}px`,
            top: `${menu.y}px`
          }}
        >
          <button
            onClick={() => {
              onRenameCategory(menu.category);
              setMenu(null);
            }}
            type="button"
          >
            重命名
          </button>
          <button
            className="danger"
            onClick={() => {
              onDeleteCategory(menu.category);
              setMenu(null);
            }}
            type="button"
          >
            删除分类
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function iconForCategory(category: string) {
  switch (category) {
    case "全部":
      return "□";
    case "开发":
      return "</>";
    case "UI":
      return "◐";
    case "笔记":
      return "✎";
    default:
      return "•••";
  }
}
