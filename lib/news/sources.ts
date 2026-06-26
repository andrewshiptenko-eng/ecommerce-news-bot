export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  siteUrl: string;
  categoryHint: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "vc",
    name: "VC.ru",
    rssUrl: "https://vc.ru/rss",
    siteUrl: "https://vc.ru",
    categoryHint: "tech",
  },
  {
    id: "kommersant",
    name: "Коммерсантъ",
    rssUrl: "https://www.kommersant.ru/RSS/main.xml",
    siteUrl: "https://www.kommersant.ru",
    categoryHint: "regulation",
  },
  {
    id: "retail",
    name: "Retail.ru",
    rssUrl: "https://www.retail.ru/rss/",
    siteUrl: "https://www.retail.ru",
    categoryHint: "marketplaces",
  },
  {
    id: "cnews",
    name: "CNews",
    rssUrl: "https://www.cnews.ru/inc/rss/out.xml",
    siteUrl: "https://www.cnews.ru",
    categoryHint: "tech",
  },
  {
    id: "rbc",
    name: "РБК",
    rssUrl: "https://www.rbc.ru/rss/",
    siteUrl: "https://www.rbc.ru",
    categoryHint: "startups",
  },
];
