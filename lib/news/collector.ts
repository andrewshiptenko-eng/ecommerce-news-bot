import { NEWS_SOURCES, type NewsSource } from "./sources";
import { generateFingerprint } from "./deduplicator";
import type { ParsedNewsItem, CollectionResult } from "./types";

function parseRssDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function extractRssItems(xml: string, source: NewsSource): ParsedNewsItem[] {
  const items: ParsedNewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title") || "Без заголовка";
    const link = extractTag(block, "link") || "";
    const description = extractTag(block, "description");
    const pubDate = extractTag(block, "pubDate");

    const annotation = (description || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 500);

    if (!link) continue;

    items.push({
      title,
      annotation,
      source: source.name,
      sourceUrl: link,
      categoryId: source.categoryHint,
      publishedAt: parseRssDate(pubDate),
      fingerprint: generateFingerprint(title, link),
    });
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );
  const match = regex.exec(xml);
  if (!match) return "";
  return (match[1] || match[2] || "").trim();
}

async function fetchSource(
  source: NewsSource,
  signal?: AbortSignal
): Promise<{ items: ParsedNewsItem[]; error?: string }> {
  try {
    const response = await fetch(source.rssUrl, {
      signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; EcomNewsBot/1.0; +https://ecomnewsbot.example.com)",
      },
    });

    if (!response.ok) {
      return {
        items: [],
        error: `HTTP ${response.status} для ${source.name}`,
      };
    }

    const xml = await response.text();
    const items = extractRssItems(xml, source);

    return { items };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { items: [], error: `Таймаут для ${source.name}` };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { items: [], error: `${source.name}: ${message}` };
  }
}

export async function collectFromSources(
  existingFingerprints: Set<string>,
  timeoutMs = 15_000
): Promise<CollectionResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const allSources = NEWS_SOURCES.map((source) =>
      fetchSource(source, controller.signal)
    );
    const results = await Promise.allSettled(allSources);

    const items: ParsedNewsItem[] = [];
    const errors: string[] = [];
    let duplicates = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        errors.push(`${NEWS_SOURCES[i].name}: ${result.reason}`);
        continue;
      }

      const { items: sourceItems, error } = result.value;
      if (error) errors.push(error);

      for (const item of sourceItems) {
        if (existingFingerprints.has(item.fingerprint)) {
          duplicates++;
          continue;
        }
        existingFingerprints.add(item.fingerprint);
        items.push(item);
      }
    }

    return {
      collected: items.length + duplicates,
      newItems: items.length,
      duplicates,
      errors,
      items,
    };
  } finally {
    clearTimeout(timer);
  }
}
