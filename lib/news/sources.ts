export interface NewsSource {
  id: string;
  name: string;
  rssUrl: string;
  siteUrl: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "vc",
    name: "VC.ru",
    rssUrl: "https://vc.ru/rss",
    siteUrl: "https://vc.ru",
  },
  {
    id: "kommersant",
    name: "Коммерсантъ",
    rssUrl: "https://www.kommersant.ru/RSS/main.xml",
    siteUrl: "https://www.kommersant.ru",
  },
  {
    id: "retail",
    name: "Retail.ru",
    rssUrl: "https://www.retail.ru/rss/",
    siteUrl: "https://www.retail.ru",
  },
  {
    id: "cnews",
    name: "CNews",
    rssUrl: "https://www.cnews.ru/inc/rss/news.xml",
    siteUrl: "https://www.cnews.ru",
  },
  {
    id: "tadviser",
    name: "TAdviser",
    rssUrl:
      "https://www.tadviser.ru/index.php?title=%D0%9A%D0%B0%D1%82%D0%B5%D0%B3%D0%BE%D1%80%D0%B8%D1%8F:%D0%9D%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8&feed=atom",
    siteUrl: "https://www.tadviser.ru",
  },
  {
    id: "interfax",
    name: "Интерфакс",
    rssUrl: "https://www.interfax.ru/rss.asp",
    siteUrl: "https://www.interfax.ru",
  },
  {
    id: "tass",
    name: "ТАСС",
    rssUrl: "https://tass.ru/rss/v2.xml",
    siteUrl: "https://tass.ru",
  },
  {
    id: "prime",
    name: "Прайм",
    rssUrl: "https://1prime.ru/export/rss2/index.xml",
    siteUrl: "https://1prime.ru",
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    rssUrl: "https://techcrunch.com/feed/",
    siteUrl: "https://techcrunch.com",
  },
  {
    id: "theverge",
    name: "The Verge",
    rssUrl: "https://www.theverge.com/rss/index.xml",
    siteUrl: "https://www.theverge.com",
  },
  {
    id: "wired",
    name: "Wired",
    rssUrl: "https://www.wired.com/feed/rss",
    siteUrl: "https://www.wired.com",
  },
  {
    id: "arstechnica",
    name: "Ars Technica",
    rssUrl: "https://feeds.arstechnica.com/arstechnica/index",
    siteUrl: "https://arstechnica.com",
  },
  {
    id: "ecommercenews",
    name: "Ecommerce News EU",
    rssUrl: "https://ecommercenews.eu/feed/",
    siteUrl: "https://ecommercenews.eu",
  },
  {
    id: "practicalecommerce",
    name: "Practical Ecommerce",
    rssUrl: "https://www.practicalecommerce.com/feed",
    siteUrl: "https://www.practicalecommerce.com",
  },
  {
    id: "digitalcommerce360",
    name: "Digital Commerce 360",
    rssUrl: "https://www.digitalcommerce360.com/feed/",
    siteUrl: "https://www.digitalcommerce360.com",
  },
  {
    id: "globalcompetitionreview",
    name: "Global Competition Review",
    rssUrl: "https://globalcompetitionreview.com/rss",
    siteUrl: "https://globalcompetitionreview.com",
  },
];
