export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export async function openUrl(url: string) {
  await chrome.tabs.create({ url });
}
