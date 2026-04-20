export interface SiteItem {
  id: string;
  title: string;
  url: string;
  normalizedUrl: string;
  categories: string[];
  note: string;
  createdAt: number;
  lastOpenedAt: number;
}
