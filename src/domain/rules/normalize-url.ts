export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const url = new URL(trimmed);
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase();

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString().replace(/\/$/, url.pathname === "/" ? "/" : "");
}
