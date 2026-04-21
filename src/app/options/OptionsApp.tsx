import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { addCategory, DuplicateCategoryError, InvalidCategoryError } from "../../application/use-cases/add-category";
import {
  CategoryNotFoundError,
  deleteCategory,
  ProtectedCategoryError
} from "../../application/use-cases/delete-category";
import { queryCategories } from "../../application/use-cases/query-categories";
import { queryDebugInfo, type DebugInfo } from "../../application/use-cases/query-debug-info";
import { FALLBACK_CATEGORY } from "../../domain/models/category";
import type { CategoryItem } from "../../domain/models/category";

function formatTime(timestamp: number | null) {
  if (!timestamp) {
    return "尚未记录";
  }

  return new Date(timestamp).toLocaleString("zh-CN", {
    hour12: false
  });
}

const shortcuts = [
  {
    label: "快捷键收录",
    value: "Alt + Shift + K"
  },
  {
    label: "打开设置页",
    value: "扩展详情页 -> 扩展程序选项"
  }
];

export function OptionsApp() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCategoryName, setDeletingCategoryName] = useState("");

  const canSubmit = useMemo(() => newCategory.trim().length > 0, [newCategory]);

  useEffect(() => {
    void refreshOptionsData();
  }, []);

  async function refreshOptionsData() {
    const [info, loadedCategories] = await Promise.all([
      queryDebugInfo(),
      queryCategories()
    ]);

    setDebugInfo(info);
    setCategories(loadedCategories);
  }

  async function handleAddCategorySubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setCategoryMessage("");
    setIsSubmitting(true);

    try {
      const category = await addCategory(newCategory);
      setNewCategory("");
      setCategoryMessage(`已新增分类：${category.name}`);
      await refreshOptionsData();
    } catch (error) {
      if (error instanceof DuplicateCategoryError || error instanceof InvalidCategoryError) {
        setCategoryMessage(error.message);
      } else {
        setCategoryMessage("新增分类失败，请稍后重试");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCategory(name: string) {
    setCategoryMessage("");
    setDeletingCategoryName(name);

    try {
      await deleteCategory(name);
      setCategoryMessage(`已删除分类：${name}，相关网站已自动归入“其他”`);
      await refreshOptionsData();
    } catch (error) {
      if (error instanceof ProtectedCategoryError || error instanceof CategoryNotFoundError) {
        setCategoryMessage(error.message);
      } else {
        setCategoryMessage("删除分类失败，请稍后重试");
      }
    } finally {
      setDeletingCategoryName("");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        background:
          "radial-gradient(circle at top right, rgba(45, 88, 219, 0.08), transparent 22%), var(--bg)"
      }}
    >
      <section
        style={{
          maxWidth: "880px",
          margin: "0 auto",
          display: "grid",
          gap: "20px"
        }}
      >
        <header
          style={{
            background: "var(--panel)",
            border: "2px solid var(--line)",
            boxShadow: "var(--shadow)",
            padding: "24px 28px"
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)"
            }}
          >
            PinBase Options
          </p>
          <h1 style={{ margin: 0, fontSize: "32px", lineHeight: 1.1 }}>插件设置与状态</h1>
          <p style={{ margin: "14px 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
            这里可以查看当前状态，也可以管理分类。现在除了“其他”这个兜底分类外，其余分类都可以删；更顺手的重命名和右键操作已经放进 popup 里了。
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px"
          }}
        >
          <InfoCard title="已收藏网站" value={debugInfo ? String(debugInfo.siteCount) : "..."} />
          <InfoCard title="分类数量" value={debugInfo ? String(debugInfo.categoryCount) : "..."} />
          <InfoCard
            title="当前分类记忆"
            value={debugInfo ? debugInfo.lastSelectedCategory : "..."}
          />
          <InfoCard
            title="后台最近活跃"
            value={debugInfo ? formatTime(debugInfo.lastBackgroundWakeAt) : "..."}
          />
        </section>

        <section
          style={{
            background: "var(--panel)",
            border: "2px solid var(--line)",
            padding: "24px 28px",
            display: "grid",
            gap: "16px"
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>分类管理</h2>
            <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
              你可以在这里新增分类。删除分类后，原来挂在这个分类下的网站会自动转入“其他”。
            </p>
          </div>

          <form
            onSubmit={(event) => void handleAddCategorySubmit(event)}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "12px"
            }}
          >
            <input
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="输入新分类名称，例如：AI 工具"
              style={{
                height: "52px",
                border: "2px solid var(--line)",
                padding: "0 16px",
                background: "#fff"
              }}
              value={newCategory}
            />
            <button
              disabled={!canSubmit || isSubmitting}
              style={{
                minWidth: "120px",
                border: "2px solid var(--line)",
                background: !canSubmit || isSubmitting ? "#b98b94" : "var(--red)",
                color: "#fff",
                fontWeight: 800,
                boxShadow: "var(--shadow)",
                cursor: !canSubmit || isSubmitting ? "not-allowed" : "pointer"
              }}
              type="submit"
            >
              {isSubmitting ? "新增中..." : "新增分类"}
            </button>
          </form>

          {categoryMessage ? (
            <p style={{ margin: 0, color: "#b21d31", fontWeight: 700 }}>{categoryMessage}</p>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px"
            }}
          >
            {categories.map((category) => {
              const canDelete = category.name !== FALLBACK_CATEGORY;

              return (
                <div
                  key={category.name}
                  style={{
                    border: "2px solid var(--line)",
                    background: "#fff",
                    padding: "14px 16px",
                    display: "grid",
                    gap: "12px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px"
                    }}
                  >
                    <strong>{category.name}</strong>
                    {category.builtIn ? (
                      <span
                        style={{
                          border: "2px solid var(--line)",
                          padding: "2px 8px",
                          fontSize: "12px",
                          fontWeight: 800,
                          background: "#f5ecd8"
                        }}
                      >
                        默认
                      </span>
                    ) : null}
                  </div>

                  {canDelete ? (
                    <button
                      onClick={() => void handleDeleteCategory(category.name)}
                      style={{
                        height: "42px",
                        border: "2px solid var(--line)",
                        background:
                          deletingCategoryName === category.name ? "#c88f98" : "#fff",
                        color: "var(--line)",
                        fontWeight: 800,
                        cursor:
                          deletingCategoryName === category.name ? "wait" : "pointer"
                      }}
                      type="button"
                    >
                      {deletingCategoryName === category.name ? "删除中..." : "删除分类"}
                    </button>
                  ) : (
                    <div
                      style={{
                        minHeight: "42px",
                        display: "flex",
                        alignItems: "center",
                        color: "var(--muted)",
                        fontSize: "13px",
                        fontWeight: 700
                      }}
                    >
                      “其他”是兜底分类，保留给自动归类使用
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            background: "var(--panel)",
            border: "2px solid var(--line)",
            padding: "24px 28px"
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "16px" }}>快捷操作</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            {shortcuts.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                  padding: "14px 16px",
                  border: "2px solid var(--line)",
                  background: "#fff"
                }}
              >
                <strong>{item.label}</strong>
                <span style={{ color: "var(--muted)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <article
      style={{
        background: "var(--panel)",
        border: "2px solid var(--line)",
        boxShadow: "var(--shadow)",
        padding: "18px 20px"
      }}
    >
      <p
        style={{
          margin: "0 0 10px",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--muted)"
        }}
      >
        {title}
      </p>
      <strong style={{ fontSize: "24px", lineHeight: 1.2 }}>{value}</strong>
    </article>
  );
}
