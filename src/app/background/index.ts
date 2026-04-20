import { normalizeUrl } from "../../domain/rules/normalize-url";
import { setBadgeActive } from "../../infrastructure/chrome/badge";
import { loadStorage, saveStorage } from "../../infrastructure/chrome/storage";
import { getCurrentTab } from "../../infrastructure/chrome/tabs";

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "add-current-site") return;

  const tab = await getCurrentTab();
  if (!tab?.url || !tab.title) return;

  try {
    const storage = await loadStorage();
    const normalizedUrl = normalizeUrl(tab.url);
    const duplicated = storage.sites.some(
      (site) => site.normalizedUrl === normalizedUrl
    );

    if (duplicated) return;

    const now = Date.now();
    storage.sites.unshift({
      id: crypto.randomUUID(),
      title: tab.title,
      url: tab.url,
      normalizedUrl,
      categories: ["其他"],
      note: "",
      createdAt: now,
      lastOpenedAt: now
    });

    await saveStorage(storage);
    await setBadgeActive(true);
  } catch (error) {
    console.error("PinBase quick add failed", error);
  }
});

chrome.tabs.onActivated.addListener(async () => {
  await updateBadgeForCurrentTab();
});

chrome.tabs.onUpdated.addListener(async (_tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    await updateBadgeForCurrentTab();
  }
});

async function updateBadgeForCurrentTab() {
  const tab = await getCurrentTab();
  if (!tab?.url) {
    await setBadgeActive(false);
    return;
  }

  try {
    const normalizedUrl = normalizeUrl(tab.url);
    const storage = await loadStorage();
    const exists = storage.sites.some(
      (site) => site.normalizedUrl === normalizedUrl
    );
    await setBadgeActive(exists);
  } catch {
    await setBadgeActive(false);
  }
}
