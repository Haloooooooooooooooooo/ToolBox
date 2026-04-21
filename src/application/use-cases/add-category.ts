import type { CategoryItem } from "../../domain/models/category";
import { DEFAULT_CATEGORIES } from "../../domain/models/category";
import { loadStorage, saveStorage } from "../../infrastructure/chrome/storage";

export class DuplicateCategoryError extends Error {
  constructor() {
    super("该分类已经存在");
    this.name = "DuplicateCategoryError";
  }
}

export class InvalidCategoryError extends Error {
  constructor(message = "分类名称不合法") {
    super(message);
    this.name = "InvalidCategoryError";
  }
}

export function normalizeCategoryInput(input: string) {
  return input.trim();
}

export async function addCategory(name: string): Promise<CategoryItem> {
  const normalizedName = normalizeCategoryInput(name);

  if (!normalizedName) {
    throw new InvalidCategoryError("分类名称不能为空");
  }

  if (normalizedName.length > 20) {
    throw new InvalidCategoryError("分类名称不能超过 20 个字符");
  }

  const storage = await loadStorage();
  const exists = storage.categories.some(
    (category) => category.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (exists) {
    throw new DuplicateCategoryError();
  }

  const category: CategoryItem = {
    name: normalizedName,
    builtIn: (DEFAULT_CATEGORIES as readonly string[]).includes(normalizedName),
    createdAt: Date.now()
  };

  await saveStorage({
    ...storage,
    categories: [...storage.categories, category]
  });

  return category;
}
