import { normalizeUrl } from "../../domain/rules/normalize-url";
import type { SiteItem } from "../../domain/models/site";
import { loadStorage, saveStorage } from "../../infrastructure/chrome/storage";

export interface SaveSiteInput {
  title: string;
  url: string;
  note: string;
  category: string;
}

export class DuplicateSiteError extends Error {
  constructor() {
    super("该网站已经收藏过了");
    this.name = "DuplicateSiteError";
  }
}

export class InvalidSiteError extends Error {
  constructor(message = "当前页面无法收藏") {
    super(message);
    this.name = "InvalidSiteError";
  }
}

function buildSite(input: SaveSiteInput): SiteItem {
  const title = input.title.trim();
  const url = input.url.trim();
  const normalizedUrl = normalizeUrl(url);
  const now = Date.now();

  if (!title || !url) {
    throw new InvalidSiteError("网站名称和链接不能为空");
  }

  return {
    id: crypto.randomUUID(),
    title,
    url,
    normalizedUrl,
    categories: [input.category || "其他"],
    note: input.note.trim(),
    createdAt: now,
    lastOpenedAt: now
  };
}

export async function addSite(input: SaveSiteInput): Promise<SiteItem> {
  let site: SiteItem;

  try {
    site = buildSite(input);
  } catch (error) {
    if (error instanceof InvalidSiteError) {
      throw error;
    }

    throw new InvalidSiteError("网站链接格式不正确");
  }

  const storage = await loadStorage();
  const duplicated = storage.sites.some(
    (item) => item.normalizedUrl === site.normalizedUrl
  );

  if (duplicated) {
    throw new DuplicateSiteError();
  }

  await saveStorage({
    ...storage,
    sites: [site, ...storage.sites]
  });

  return site;
}
