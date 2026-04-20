import type { CategoryItem } from "../../domain/models/category";
import type { SiteItem } from "../../domain/models/site";

export interface PinBaseStorage {
  sites: SiteItem[];
  categories: CategoryItem[];
  ui: {
    lastSelectedCategory: string;
  };
}

const STORAGE_KEY = "pinbase";

const defaultStorage: PinBaseStorage = {
  sites: [],
  categories: [
    { name: "开发", builtIn: true, createdAt: Date.now() },
    { name: "UI", builtIn: true, createdAt: Date.now() },
    { name: "笔记", builtIn: true, createdAt: Date.now() },
    { name: "其他", builtIn: true, createdAt: Date.now() }
  ],
  ui: {
    lastSelectedCategory: "全部"
  }
};

export async function loadStorage(): Promise<PinBaseStorage> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as PinBaseStorage | undefined) ?? defaultStorage;
}

export async function saveStorage(storage: PinBaseStorage): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: storage });
}
