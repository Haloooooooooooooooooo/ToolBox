import { openUrl } from "../../infrastructure/chrome/tabs";
import { listSites, saveSites } from "../../infrastructure/repositories/site-repository";

export async function openSite(siteId: string): Promise<void> {
  const sites = await listSites();
  const target = sites.find((site) => site.id === siteId);

  if (!target) {
    return;
  }

  const now = Date.now();
  const nextSites = sites.map((site) =>
    site.id === siteId ? { ...site, lastOpenedAt: now } : site
  );

  await saveSites(nextSites);
  await openUrl(target.url);
}
