function toOriginPattern(url: string) {
  const parsed = new URL(url);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  return `${parsed.origin}/*`;
}

export async function ensureOriginPermission(url: string) {
  const originPattern = toOriginPattern(url);
  if (!originPattern) {
    return false;
  }

  const alreadyGranted = await chrome.permissions.contains({
    origins: [originPattern]
  });

  if (alreadyGranted) {
    return true;
  }

  try {
    return await chrome.permissions.request({
      origins: [originPattern]
    });
  } catch {
    return false;
  }
}
