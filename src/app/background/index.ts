import { addSite, DuplicateSiteError, InvalidSiteError } from "../../application/use-cases/add-site";
import { normalizeUrl } from "../../domain/rules/normalize-url";
import { setBadgeActive } from "../../infrastructure/chrome/badge";
import { showPageToast } from "../../infrastructure/chrome/page-toast";
import { ensureOriginPermission } from "../../infrastructure/chrome/permissions";
import { loadStorage } from "../../infrastructure/chrome/storage";
import { getCurrentTab } from "../../infrastructure/chrome/tabs";

const DEBUG_KEY = "pinbase_debug";

async function markBackgroundWake() {
  await chrome.storage.local.set({
    [DEBUG_KEY]: {
      lastBackgroundWakeAt: Date.now()
    }
  });
}

void markBackgroundWake();

chrome.runtime.onStartup.addListener(() => {
  void markBackgroundWake();
});

chrome.runtime.onInstalled.addListener(() => {
  void markBackgroundWake();
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "add-current-site") return;

  const tab = await getCurrentTab();
  if (!tab?.id || !tab.url || !tab.title) return;

  const toastPermissionGranted = await ensureOriginPermission(tab.url);

  try {
    await addSite({
      title: tab.title,
      url: tab.url,
      note: "",
      category: "其他"
    });
    await setBadgeActive(true);
    await markBackgroundWake();

    if (toastPermissionGranted) {
      await showPageToast(tab.id, `已收录到 PinBase: ${tab.title}`, "success");
    }
  } catch (error) {
    if (error instanceof DuplicateSiteError) {
      if (toastPermissionGranted) {
        await showPageToast(tab.id, `这个网站已经收录过了: ${tab.title}`, "info");
      }
      return;
    }

    if (error instanceof InvalidSiteError) {
      if (toastPermissionGranted) {
        await showPageToast(tab.id, "当前页面暂时无法收录", "error");
      }
      return;
    }

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
    const exists = storage.sites.some((site) => site.normalizedUrl === normalizedUrl);
    await setBadgeActive(exists);
    await markBackgroundWake();
  } catch {
    await setBadgeActive(false);
  }
}
