export async function setBadgeActive(active: boolean): Promise<void> {
  await chrome.action.setBadgeText({ text: active ? "已藏" : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#16a34a" });
  await chrome.action.setBadgeTextColor({ color: "#ffffff" });
}
