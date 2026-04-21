import { DuplicateCategoryError, InvalidCategoryError, normalizeCategoryInput } from "./add-category";
import { FALLBACK_CATEGORY } from "../../domain/models/category";
import { loadStorage, saveStorage } from "../../infrastructure/chrome/storage";

export class CategoryRenameNotFoundError extends Error {
  constructor() {
    super("没有找到要重命名的分类");
    this.name = "CategoryRenameNotFoundError";
  }
}

export class ProtectedCategoryRenameError extends Error {
  constructor() {
    super("“其他”是兜底分类，暂时不能重命名");
    this.name = "ProtectedCategoryRenameError";
  }
}

export async function renameCategory(currentName: string, nextName: string): Promise<void> {
  if (currentName === FALLBACK_CATEGORY) {
    throw new ProtectedCategoryRenameError();
  }

  const normalizedNextName = normalizeCategoryInput(nextName);
  if (!normalizedNextName) {
    throw new InvalidCategoryError("分类名称不能为空");
  }

  if (normalizedNextName.length > 20) {
    throw new InvalidCategoryError("分类名称不能超过 20 个字符");
  }

  const storage = await loadStorage();
  const target = storage.categories.find((category) => category.name === currentName);
  if (!target) {
    throw new CategoryRenameNotFoundError();
  }

  const duplicate = storage.categories.some(
    (category) =>
      category.name !== currentName &&
      category.name.toLowerCase() === normalizedNextName.toLowerCase()
  );

  if (duplicate) {
    throw new DuplicateCategoryError();
  }

  await saveStorage({
    ...storage,
    categories: storage.categories.map((category) =>
      category.name === currentName
        ? {
            ...category,
            name: normalizedNextName,
            builtIn: false
          }
        : category
    ),
    sites: storage.sites.map((site) => ({
      ...site,
      categories: site.categories.map((category) =>
        category === currentName ? normalizedNextName : category
      )
    })),
    ui: {
      ...storage.ui,
      lastSelectedCategory:
        storage.ui.lastSelectedCategory === currentName
          ? normalizedNextName
          : storage.ui.lastSelectedCategory
    }
  });
}
