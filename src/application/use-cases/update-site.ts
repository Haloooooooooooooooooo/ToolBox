import { normalizeUrl } from "../../domain/rules/normalize-url";
import type { SiteItem } from "../../domain/models/site";
import { loadStorage, saveStorage } from "../../infrastructure/chrome/storage";
import { DuplicateSiteError, InvalidSiteError, type SaveSiteInput } from "./add-site";

export interface UpdateSiteInput extends SaveSiteInput {
  id: string;
}

export async function updateSite(input: UpdateSiteInput): Promise<SiteItem> {
  const title = input.title.trim();
  const url = input.url.trim();

  if (!title || !url) {
    throw new InvalidSiteError("网站名称和链接不能为空");
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(url);
  } catch {
    throw new InvalidSiteError("网站链接格式不正确");
  }

  const storage = await loadStorage();
  const existing = storage.sites.find((site) => site.id === input.id);

  if (!existing) {
    throw new InvalidSiteError("未找到要编辑的网站");
  }

  const duplicated = storage.sites.some(
    (site) => site.id !== input.id && site.normalizedUrl === normalizedUrl
  );

  if (duplicated) {
    throw new DuplicateSiteError();
  }

  const updatedSite: SiteItem = {
    ...existing,
    title,
    url,
    normalizedUrl,
    categories: [input.category || "其他"],
    note: input.note.trim()
  };

  await saveStorage({
    ...storage,
    sites: storage.sites.map((site) => (site.id === input.id ? updatedSite : site))
  });

  return updatedSite;
}
