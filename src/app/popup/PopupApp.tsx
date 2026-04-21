import { useEffect, useMemo, useState } from "react";
import { addCategory, DuplicateCategoryError, InvalidCategoryError } from "../../application/use-cases/add-category";
import { addSite, DuplicateSiteError, InvalidSiteError } from "../../application/use-cases/add-site";
import {
  CategoryNotFoundError,
  deleteCategory,
  ProtectedCategoryError
} from "../../application/use-cases/delete-category";
import { deleteSite, restoreSite } from "../../application/use-cases/delete-site";
import { openSite } from "../../application/use-cases/open-site";
import { queryCategories } from "../../application/use-cases/query-categories";
import { querySites } from "../../application/use-cases/query-sites";
import {
  CategoryRenameNotFoundError,
  ProtectedCategoryRenameError,
  renameCategory
} from "../../application/use-cases/rename-category";
import { updateSite } from "../../application/use-cases/update-site";
import { AddCategoryDialog } from "../../components/AddCategoryDialog";
import { AddSiteDialog } from "../../components/AddSiteDialog";
import { CategoryNav } from "../../components/CategoryNav";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { SiteCard } from "../../components/SiteCard";
import { DEFAULT_CATEGORIES, FALLBACK_CATEGORY } from "../../domain/models/category";
import type { SiteItem } from "../../domain/models/site";
import { setBadgeActive } from "../../infrastructure/chrome/badge";
import { loadStorage } from "../../infrastructure/chrome/storage";
import { getCurrentTab } from "../../infrastructure/chrome/tabs";
import {
  consumeToast,
  getToastStorageKey,
  type ExtensionToastPayload,
  type ToastVariant
} from "../../infrastructure/chrome/toast";
import "./popup.css";

const TOAST_DURATION_MS = 3600;
const ALL_CATEGORY = "全部";

interface PopupToast {
  message: string;
  variant: ToastVariant;
}

export function PopupApp() {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [categories, setCategories] = useState<string[]>([...DEFAULT_CATEGORIES]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryPendingDelete, setCategoryPendingDelete] = useState<string | null>(null);
  const [currentTabTitle, setCurrentTabTitle] = useState("");
  const [currentTabUrl, setCurrentTabUrl] = useState("");
  const [currentTabNote, setCurrentTabNote] = useState("");
  const [currentTabCategory, setCurrentTabCategory] = useState(FALLBACK_CATEGORY);
  const [editingSite, setEditingSite] = useState<SiteItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryErrorMessage, setCategoryErrorMessage] = useState("");
  const [undoSite, setUndoSite] = useState<SiteItem | null>(null);
  const [toast, setToast] = useState<PopupToast | null>(null);

  useEffect(() => {
    void refreshSites();
    void refreshCategories();
    void hydrateCurrentTab();
    void hydrateUiPreference();
    void showPendingToast();

    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "local") return;

      if (changes[getToastStorageKey()]) {
        void showPendingToast();
      }

      if (changes.pinbase) {
        void refreshCategories();
      }
    };

    chrome.storage.onChanged.addListener(handler);
    return () => {
      chrome.storage.onChanged.removeListener(handler);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
      setUndoSite(null);
    }, TOAST_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    void persistLastCategory(activeCategory);
  }, [activeCategory]);

  const allCategories = useMemo(() => [ALL_CATEGORY, ...categories], [categories]);
  const manageableCategories = useMemo(
    () => categories.filter((category) => category !== FALLBACK_CATEGORY),
    [categories]
  );
  const normalizedSearch = search.trim().toLowerCase();
  const searchedCategory = useMemo(() => {
    if (!normalizedSearch) return null;

    return (
      categories.find((category) => category.trim().toLowerCase() === normalizedSearch) ?? null
    );
  }, [categories, normalizedSearch]);
  const displayedCategory = searchedCategory ?? activeCategory;

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesCategory =
        displayedCategory === ALL_CATEGORY || site.categories.includes(displayedCategory);
      const keyword = normalizedSearch;
      const matchesKeyword =
        keyword.length === 0 ||
        site.title.toLowerCase().includes(keyword) ||
        site.note.toLowerCase().includes(keyword) ||
        site.categories.some((category) => category.toLowerCase().includes(keyword));

      return matchesCategory && matchesKeyword;
    });
  }, [displayedCategory, normalizedSearch, sites]);

  async function refreshSites() {
    const loadedSites = await querySites();
    setSites(loadedSites);
  }

  async function refreshCategories() {
    const loadedCategories = await queryCategories();
    setCategories(loadedCategories.map((category) => category.name));
  }

  async function hydrateCurrentTab() {
    try {
      const tab = await getCurrentTab();
      setCurrentTabTitle(tab?.title ?? "");
      setCurrentTabUrl(tab?.url ?? "");
      setCurrentTabNote("");
      setCurrentTabCategory(FALLBACK_CATEGORY);
    } catch {
      setCurrentTabTitle("");
      setCurrentTabUrl("");
      setCurrentTabNote("");
      setCurrentTabCategory(FALLBACK_CATEGORY);
    }
  }

  async function hydrateUiPreference() {
    const storage = await loadStorage();
    if (storage.ui.lastSelectedCategory) {
      setActiveCategory(storage.ui.lastSelectedCategory);
    }
  }

  async function persistLastCategory(category: string) {
    const storage = await loadStorage();
    if (storage.ui.lastSelectedCategory === category) return;

    await chrome.storage.local.set({
      pinbase: {
        ...storage,
        ui: {
          ...storage.ui,
          lastSelectedCategory: category
        }
      }
    });
  }

  async function showPendingToast() {
    const pendingToast = await consumeToast();
    if (!pendingToast) return;

    applyToast(pendingToast);
    await refreshSites();
  }

  function applyToast(nextToast: ExtensionToastPayload) {
    setUndoSite(null);
    setToast({
      message: nextToast.message,
      variant: nextToast.variant
    });
  }

  function showToast(message: string, variant: ToastVariant) {
    setToast({ message, variant });
  }

  async function openAddDialog() {
    setEditingSite(null);
    setErrorMessage("");
    await refreshCategories();
    await hydrateCurrentTab();
    setDialogOpen(true);
  }

  function openEditDialog(site: SiteItem) {
    setEditingSite(site);
    setErrorMessage("");
    setCurrentTabTitle(site.title);
    setCurrentTabUrl(site.url);
    setCurrentTabNote(site.note);
    setCurrentTabCategory(site.categories[0] ?? FALLBACK_CATEGORY);
    setDialogOpen(true);
  }

  async function handleSaveSite(input: {
    title: string;
    url: string;
    note: string;
    category: string;
  }) {
    setIsSaving(true);
    setErrorMessage("");

    try {
      if (editingSite) {
        await updateSite({ ...input, id: editingSite.id });
        showToast(`已更新 ${input.title.trim() || editingSite.title}`, "success");
      } else {
        await addSite(input);
        await setBadgeActive(true);
        showToast("网站已保存", "success");
      }

      setUndoSite(null);
      await refreshSites();
      setDialogOpen(false);
      setEditingSite(null);
    } catch (error) {
      if (error instanceof DuplicateSiteError || error instanceof InvalidSiteError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("保存失败，请稍后重试");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateCategory(name: string) {
    setCategoryErrorMessage("");
    setIsSavingCategory(true);

    try {
      const category = await addCategory(name);
      await refreshCategories();
      setCurrentTabCategory(category.name);
      setCategoryDialogOpen(false);
      showToast(`已新增分类 ${category.name}`, "success");
    } catch (error) {
      if (error instanceof DuplicateCategoryError || error instanceof InvalidCategoryError) {
        setCategoryErrorMessage(error.message);
      } else {
        setCategoryErrorMessage("新增分类失败，请稍后重试");
      }
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleRenameCategory(name: string) {
    if (!editingCategoryName) return;

    setCategoryErrorMessage("");
    setIsSavingCategory(true);

    try {
      await renameCategory(editingCategoryName, name);
      if (activeCategory === editingCategoryName) {
        setActiveCategory(name.trim());
      }
      if (currentTabCategory === editingCategoryName) {
        setCurrentTabCategory(name.trim());
      }
      await refreshCategories();
      await refreshSites();
      setRenameDialogOpen(false);
      setEditingCategoryName("");
      showToast(`已将分类改名为 ${name.trim()}`, "success");
    } catch (error) {
      if (
        error instanceof DuplicateCategoryError ||
        error instanceof InvalidCategoryError ||
        error instanceof CategoryRenameNotFoundError ||
        error instanceof ProtectedCategoryRenameError
      ) {
        setCategoryErrorMessage(error.message);
      } else {
        setCategoryErrorMessage("重命名失败，请稍后重试");
      }
    } finally {
      setIsSavingCategory(false);
    }
  }

  function requestDeleteCategory(name: string) {
    setCategoryPendingDelete(name);
  }

  async function confirmDeleteCategory() {
    if (!categoryPendingDelete) return;

    setCategoryErrorMessage("");
    setIsDeletingCategory(true);

    try {
      await deleteCategory(categoryPendingDelete);
      if (activeCategory === categoryPendingDelete) {
        setActiveCategory(ALL_CATEGORY);
      }
      if (currentTabCategory === categoryPendingDelete) {
        setCurrentTabCategory(FALLBACK_CATEGORY);
      }
      await refreshCategories();
      await refreshSites();
      showToast(`已删除分类 ${categoryPendingDelete}，相关网站已归入“其他”`, "info");
      setCategoryPendingDelete(null);
    } catch (error) {
      if (error instanceof ProtectedCategoryError || error instanceof CategoryNotFoundError) {
        showToast(error.message, "error");
      } else {
        showToast("删除分类失败，请稍后重试", "error");
      }
    } finally {
      setIsDeletingCategory(false);
    }
  }

  async function handleOpenSite(site: SiteItem) {
    await openSite(site.id);
    await refreshSites();
  }

  async function handleDeleteSite(site: SiteItem) {
    const deleted = await deleteSite(site.id);
    if (!deleted) return;

    setUndoSite(deleted);
    showToast(`已删除 ${deleted.title}`, "info");
    await refreshSites();
  }

  async function handleUndoDelete() {
    if (!undoSite) return;

    await restoreSite(undoSite);
    showToast(`已恢复 ${undoSite.title}`, "success");
    setUndoSite(null);
    await refreshSites();
  }

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
          <button className="cta" onClick={() => void openAddDialog()} type="button">
            <span className="plus">+</span>
            添加当前网站
          </button>
        </section>

        <div className="content">
          <CategoryNav
            activeCategory={displayedCategory}
            categories={allCategories}
            manageableCategories={manageableCategories}
            onAddCategory={() => {
              setEditingCategoryName("");
              setCategoryErrorMessage("");
              setCategoryDialogOpen(true);
            }}
            onDeleteCategory={requestDeleteCategory}
            onRenameCategory={(category) => {
              setEditingCategoryName(category);
              setCategoryErrorMessage("");
              setRenameDialogOpen(true);
            }}
            onSelect={setActiveCategory}
          />

          <main className="main">
            <div className="section-head">
              <h2>Pinned Boards</h2>
              <span>{filteredSites.length} Items</span>
            </div>

            {filteredSites.length > 0 ? (
              <div className="grid">
                {filteredSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    onDelete={(item) => {
                      void handleDeleteSite(item);
                    }}
                    onEdit={openEditDialog}
                    onOpen={(item) => {
                      void handleOpenSite(item);
                    }}
                    site={site}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>还没有收藏网站</h3>
                <p>点击上方“添加当前网站”，把你常用的页面收到 PinBase 里。</p>
              </div>
            )}
          </main>
        </div>

        {toast ? (
          <div className="toast-slot">
            <div className={`toast ${toast.variant}`} role="status">
            <span>{toast.message}</span>
            {undoSite ? (
              <button className="toast-action" onClick={() => void handleUndoDelete()} type="button">
                撤销
              </button>
            ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <AddSiteDialog
        categories={categories}
        errorMessage={errorMessage}
        initialCategory={currentTabCategory}
        initialNote={currentTabNote}
        initialTitle={currentTabTitle}
        initialUrl={currentTabUrl}
        isSaving={isSaving}
        onClose={() => {
          setDialogOpen(false);
          setEditingSite(null);
          setErrorMessage("");
        }}
        onSave={(input) => void handleSaveSite(input)}
        open={dialogOpen}
        submitLabel={editingSite ? "保存修改" : "保存"}
        title={editingSite ? "编辑网站" : "添加网站"}
      />

      <AddCategoryDialog
        errorMessage={categoryErrorMessage}
        isSaving={isSavingCategory}
        onClose={() => {
          setCategoryDialogOpen(false);
          setCategoryErrorMessage("");
        }}
        onSave={(name) => void handleCreateCategory(name)}
        open={categoryDialogOpen}
      />

      <AddCategoryDialog
        errorMessage={categoryErrorMessage}
        initialName={editingCategoryName}
        isSaving={isSavingCategory}
        onClose={() => {
          setRenameDialogOpen(false);
          setEditingCategoryName("");
          setCategoryErrorMessage("");
        }}
        onSave={(name) => void handleRenameCategory(name)}
        open={renameDialogOpen}
        submitLabel="保存名称"
        title="重命名分类"
      />

      <ConfirmDialog
        confirmLabel="确认删除"
        description={
          categoryPendingDelete
            ? `删除“${categoryPendingDelete}”后，原来挂在这个分类下的网站会自动归到“其他”。`
            : ""
        }
        isConfirming={isDeletingCategory}
        onClose={() => {
          if (isDeletingCategory) return;
          setCategoryPendingDelete(null);
        }}
        onConfirm={() => {
          void confirmDeleteCategory();
        }}
        open={Boolean(categoryPendingDelete)}
        title="确认删除分类"
      />
    </>
  );
}
