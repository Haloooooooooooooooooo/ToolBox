import type { SiteItem } from "../../domain/models/site";
import { listSites } from "../../infrastructure/repositories/site-repository";

export async function querySites(): Promise<SiteItem[]> {
  const sites = await listSites();
  return [...sites].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
}
