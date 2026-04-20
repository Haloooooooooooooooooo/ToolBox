export async function setBadgeActive(active: boolean): Promise<void> {
  await chrome.action.setBadgeText({ text: active ? "•" : "" });
  if (active) {
    await chrome.action.setBadgeBackgroundColor({ color: "#c4122f" });
  }
}
