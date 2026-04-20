import type { SiteItem } from "../../domain/models/site";
import { loadStorage, saveStorage } from "../chrome/storage";

export async function listSites(): Promise<SiteItem[]> {
  const storage = await loadStorage();
  return storage.sites;
}

export async function saveSites(sites: SiteItem[]): Promise<void> {
  const storage = await loadStorage();
  await saveStorage({ ...storage, sites });
}
