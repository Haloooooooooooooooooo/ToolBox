import { loadStorage } from "../../infrastructure/chrome/storage";

export interface DebugInfo {
  siteCount: number;
  categoryCount: number;
  lastSelectedCategory: string;
  lastBackgroundWakeAt: number | null;
}

export async function queryDebugInfo(): Promise<DebugInfo> {
  const storage = await loadStorage();
  const debugRecord = await chrome.storage.local.get("pinbase_debug");
  const rawWakeAt = debugRecord["pinbase_debug"]?.lastBackgroundWakeAt;

  return {
    siteCount: storage.sites.length,
    categoryCount: storage.categories.length,
    lastSelectedCategory: storage.ui.lastSelectedCategory,
    lastBackgroundWakeAt: typeof rawWakeAt === "number" ? rawWakeAt : null
  };
}
