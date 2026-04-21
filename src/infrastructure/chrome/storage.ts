import type { CategoryItem } from "../../domain/models/category";
import { DEFAULT_CATEGORIES, FALLBACK_CATEGORY } from "../../domain/models/category";
import type { SiteItem } from "../../domain/models/site";

export interface PinBaseStorage {
  sites: SiteItem[];
  categories: CategoryItem[];
  ui: {
    lastSelectedCategory: string;
  };
}

const STORAGE_KEY = "pinbase";
const ALL_CATEGORY = "全部";

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  "閸忋劑鍎?": ALL_CATEGORY,
  "瀵偓閸?": "开发",
  "缁楁棁顔?": "笔记",
  "閸忔湹绮?": FALLBACK_CATEGORY,
  "寮€鍙?": "开发",
  "绗旇": "笔记",
  "鍏朵粬": FALLBACK_CATEGORY,
  "鍏ㄩ儴": ALL_CATEGORY
};

function normalizeCategoryName(name: string): string {
  return LEGACY_CATEGORY_MAP[name] ?? name;
}

function createDefaultCategories(): CategoryItem[] {
  const createdAt = Date.now();
  return DEFAULT_CATEGORIES.map((name) => ({
    name,
    builtIn: true,
    createdAt
  }));
}

function createDefaultStorage(): PinBaseStorage {
  return {
    sites: [],
    categories: createDefaultCategories(),
    ui: {
      lastSelectedCategory: ALL_CATEGORY
    }
  };
}

function sanitizeSites(input: unknown): SiteItem[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((site) => {
    if (!site || typeof site !== "object") return [];

    const candidate = site as Partial<SiteItem>;

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.url !== "string" ||
      typeof candidate.normalizedUrl !== "string"
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        title: candidate.title,
        url: candidate.url,
        normalizedUrl: candidate.normalizedUrl,
        categories: Array.isArray(candidate.categories)
          ? candidate.categories.map((category) => normalizeCategoryName(String(category)))
          : [FALLBACK_CATEGORY],
        note: typeof candidate.note === "string" ? candidate.note : "",
        createdAt:
          typeof candidate.createdAt === "number" ? candidate.createdAt : Date.now(),
        lastOpenedAt:
          typeof candidate.lastOpenedAt === "number"
            ? candidate.lastOpenedAt
            : Date.now()
      }
    ];
  });
}

function sanitizeCategories(input: unknown): CategoryItem[] {
  if (!Array.isArray(input)) {
    return createDefaultCategories();
  }

  const seen = new Set<string>();
  const categories = input.flatMap((category) => {
    if (!category || typeof category !== "object") return [];

    const candidate = category as Partial<CategoryItem>;
    if (typeof candidate.name !== "string") return [];

    const name = normalizeCategoryName(candidate.name);
    if (!name || seen.has(name)) return [];
    seen.add(name);

    return [
      {
        name,
        builtIn: Boolean(candidate.builtIn) && DEFAULT_CATEGORIES.includes(name as never),
        createdAt:
          typeof candidate.createdAt === "number" ? candidate.createdAt : Date.now()
      }
    ];
  });

  if (!categories.some((item) => item.name === FALLBACK_CATEGORY)) {
    categories.push({
      name: FALLBACK_CATEGORY,
      builtIn: true,
      createdAt: Date.now()
    });
  }

  return categories.length > 0 ? categories : createDefaultCategories();
}

function sanitizeStorage(input: unknown): PinBaseStorage {
  if (!input || typeof input !== "object") {
    return createDefaultStorage();
  }

  const candidate = input as Partial<PinBaseStorage>;

  return {
    sites: sanitizeSites(candidate.sites),
    categories: sanitizeCategories(candidate.categories),
    ui: {
      lastSelectedCategory:
        candidate.ui && typeof candidate.ui.lastSelectedCategory === "string"
          ? normalizeCategoryName(candidate.ui.lastSelectedCategory)
          : ALL_CATEGORY
    }
  };
}

export async function loadStorage(): Promise<PinBaseStorage> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return sanitizeStorage(result[STORAGE_KEY]);
}

export async function saveStorage(storage: PinBaseStorage): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: sanitizeStorage(storage) });
}
