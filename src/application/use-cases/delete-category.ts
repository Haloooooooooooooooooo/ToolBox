import { FALLBACK_CATEGORY } from "../../domain/models/category";
import { loadStorage, saveStorage } from "../../infrastructure/chrome/storage";

const ALL_CATEGORY = "全部";

export class ProtectedCategoryError extends Error {
  constructor() {
    super("“其他”是兜底分类，暂时不能删除");
    this.name = "ProtectedCategoryError";
  }
}

export class CategoryNotFoundError extends Error {
  constructor() {
    super("没有找到要删除的分类");
    this.name = "CategoryNotFoundError";
  }
}

export async function deleteCategory(name: string): Promise<void> {
  if (name === FALLBACK_CATEGORY) {
    throw new ProtectedCategoryError();
  }

  const storage = await loadStorage();
  const categoryExists = storage.categories.some((category) => category.name === name);

  if (!categoryExists) {
    throw new CategoryNotFoundError();
  }

  const nextCategories = storage.categories.filter((category) => category.name !== name);
  const nextSites = storage.sites.map((site) => {
    const filteredCategories = site.categories.filter((category) => category !== name);

    return {
      ...site,
      categories: filteredCategories.length > 0 ? filteredCategories : [FALLBACK_CATEGORY]
    };
  });

  const nextLastSelectedCategory =
    storage.ui.lastSelectedCategory === name ? ALL_CATEGORY : storage.ui.lastSelectedCategory;

  await saveStorage({
    ...storage,
    categories: nextCategories,
    sites: nextSites,
    ui: {
      ...storage.ui,
      lastSelectedCategory: nextLastSelectedCategory
    }
  });
}
