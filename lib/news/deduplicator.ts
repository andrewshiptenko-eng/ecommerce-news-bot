const NORMALIZE_RE = /[^\wа-яё\s]/gi;
const EXTRA_SPACES_RE = /\s+/g;

export function generateFingerprint(title: string, sourceUrl: string): string {
  const normalized = title
    .toLowerCase()
    .replace(NORMALIZE_RE, "")
    .replace(EXTRA_SPACES_RE, " ")
    .trim()
    .slice(0, 120);

  const urlDomain = new URL(sourceUrl).hostname.replace(/^www\./, "");
  const urlPath = new URL(sourceUrl).pathname.replace(/\/$/, "");

  return `${normalized}::${urlDomain}${urlPath}`;
}
