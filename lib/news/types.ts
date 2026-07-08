export interface ParsedNewsItem {
  title: string;
  annotation: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  fingerprint: string;
}

export interface CollectionResult {
  collected: number;
  newItems: number;
  duplicates: number;
  filtered: number;
  errors: string[];
  items: ParsedNewsItem[];
}
