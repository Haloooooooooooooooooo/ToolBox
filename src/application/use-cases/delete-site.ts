import type { SiteItem } from "../../domain/models/site";
import { listSites, saveSites } from "../../infrastructure/repositories/site-repository";

export async function deleteSite(siteId: string): Promise<SiteItem | null> {
  const sites = await listSites();
  const target = sites.find((site) => site.id === siteId) ?? null;

  if (!target) {
    return null;
  }

  await saveSites(sites.filter((site) => site.id !== siteId));
  return target;
}

export async function restoreSite(site: SiteItem): Promise<void> {
  const sites = await listSites();
  if (sites.some((item) => item.id === site.id)) {
    return;
  }

  await saveSites([site, ...sites]);
}
