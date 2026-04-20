export interface CategoryItem {
  name: string;
  builtIn: boolean;
  createdAt: number;
}

export const BUILT_IN_CATEGORIES = ["开发", "UI", "笔记", "其他"] as const;
