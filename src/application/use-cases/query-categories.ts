import type { CategoryItem } from "../../domain/models/category";
import { loadStorage } from "../../infrastructure/chrome/storage";

export async function queryCategories(): Promise<CategoryItem[]> {
  const storage = await loadStorage();
  return [...storage.categories].sort((a, b) => a.createdAt - b.createdAt);
}
