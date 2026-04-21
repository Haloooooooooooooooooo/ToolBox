export interface CategoryItem {
  name: string;
  builtIn: boolean;
  createdAt: number;
}

export const DEFAULT_CATEGORIES = ["开发", "UI", "笔记", "其他"] as const;
export const FALLBACK_CATEGORY = "其他";
